import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, clearApiCache, resolveImageUrl } from "../../api/client";
import ColorPickerButton from "../../components/ColorPickerButton";
import EmojiPickerButton from "../../components/EmojiPickerButton";
import Logo from "../../components/Logo";
import SiteBackground from "../../components/SiteBackground";
import { useLanguage } from "../../i18n/LanguageContext";
import AccountView from "./AccountView";
import { darkenHex, lightenHex } from "../../utils/color";

const TABS = ["general", "modulos", "recompensas", "compartir", "respuestas"];
const TAB_LABEL_KEY = {
  general: "tabGeneral",
  modulos: "tabModules",
  recompensas: "tabRewards",
  compartir: "tabShare",
  respuestas: "tabAnswers",
};

const STATUS_STYLES = {
  published: { bg: "rgba(255,45,79,0.18)", color: "#ffb3c0" },
  draft: { bg: "rgba(255,255,255,0.08)", color: "rgba(233,233,237,0.65)" },
};

const AVATAR_PALETTE = [
  { bg: "rgba(255,45,79,0.18)", color: "#ffb3c0" },
  { bg: "rgba(79,157,255,0.18)", color: "#a8d8ff" },
  { bg: "rgba(232,177,58,0.18)", color: "#ffe0a3" },
];

const fieldLabel = { fontSize: 12, color: "rgba(233,233,237,0.6)", display: "block", marginBottom: 6 };
const fieldInput = { width: "100%", height: 42, padding: "0 12px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.14)", color: "#e9e9ed", fontSize: 14, fontFamily: "Inter,system-ui,sans-serif" };
const rowInput = { flex: 1, minWidth: 120, background: "transparent", border: "none", color: "#e9e9ed", fontSize: 14, fontFamily: "Inter,system-ui,sans-serif", outline: "none" };
const pointsInput = { width: 64, height: 32, textAlign: "center", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "#e9e9ed", fontSize: 12 };
const rowShell = { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12, padding: 14, borderRadius: 10, background: "rgba(255,255,255,0.22)", backdropFilter: "blur(28px) saturate(160%)", WebkitBackdropFilter: "blur(28px) saturate(160%)", border: "1px solid rgba(255,255,255,0.34)", boxShadow: "0 8px 32px rgba(0,0,0,0.35)" };
const addPill = { fontSize: 12, padding: "8px 14px", borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.16)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 };
const typeIcon = { color: "var(--color-gem, #ff2d4f)", fontSize: 15, width: 18, textAlign: "center" };

const SLUG_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
function randomSlug(length = 12) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => SLUG_CHARS[b % SLUG_CHARS.length]).join("");
}

function GripIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" stroke="rgba(233,233,237,0.4)" strokeWidth="2" strokeLinecap="round" fill="none">
      <line x1="4" y1="8" x2="20" y2="8"></line>
      <line x1="4" y1="16" x2="20" y2="16"></line>
    </svg>
  );
}

function QUESTION_TYPE_ICON(type) {
  if (type === "multiple_choice") return "fa-solid fa-list-check";
  if (type === "photo") return "fa-solid fa-camera";
  return "fa-solid fa-align-left";
}

function defaultPromptFor(type, t) {
  if (type === "multiple_choice") return t("dashboardPage.defaultPromptMultiple");
  if (type === "photo") return t("dashboardPage.defaultPromptPhoto");
  return t("dashboardPage.defaultPromptText");
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [creator, setCreator] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [stats, setStats] = useState({});
  const [view, setView] = useState("list");
  const [selectedExp, setSelectedExp] = useState(null);
  const [fullExperience, setFullExperience] = useState(null);
  const [editorTab, setEditorTab] = useState("general");
  const [linkRevealed, setLinkRevealed] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [players, setPlayers] = useState(null);
  const [expandedPlayer, setExpandedPlayer] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [moduleError, setModuleError] = useState(null);
  const [langOpen, setLangOpen] = useState(false);
  const [reactivatedNotice, setReactivatedNotice] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const dirtyModuleIdsRef = useRef(new Set());

  useEffect(() => {
    if (localStorage.getItem("quilt_reactivated")) {
      localStorage.removeItem("quilt_reactivated");
      setReactivatedNotice(true);
    }
  }, []);

  const confirmDiscardIfDirty = () => !dirty || confirm(t("dashboardPage.unsavedChangesConfirm"));

  const loadExperiences = () =>
    api
      .listMyExperiences()
      .then((data) => {
        setLoadError(null);
        setExperiences(data);
      })
      .catch((e) => {
        if (e.status === 401) {
          localStorage.removeItem("quilt_token");
          clearApiCache();
          navigate("/login", { replace: true });
          return;
        }
        setLoadError(e.message);
      });

  useEffect(() => {
    loadExperiences();
    api.getCurrentCreator().then(setCreator).catch(() => {});
  }, []);

  useEffect(() => {
    experiences.forEach((exp) => {
      if (stats[exp.id]) return;
      Promise.all([api.getExperienceFull(exp.id), api.getPlayers(exp.id)])
        .then(([full, ps]) => {
          const moduleCount = full.modules
            .filter((m) => m.type === "question")
            .reduce((sum, m) => sum + m.questions.length, 0);
          setStats((prev) => ({ ...prev, [exp.id]: { moduleCount, plays: ps.length } }));
        })
        .catch(() => setStats((prev) => ({ ...prev, [exp.id]: { moduleCount: 0, plays: 0 } })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experiences]);

  const refreshFullExperience = async (id = selectedExp?.id) => {
    if (!id) return;
    const full = await api.getExperienceFull(id);
    setFullExperience(full);
  };

  const selectExperience = async (exp) => {
    if (!confirmDiscardIfDirty()) return;
    dirtyModuleIdsRef.current.clear();
    setDirty(false);
    setSaveError(null);
    setSelectedExp(exp);
    setExpandedPlayer(null);
    setView("editor");
    setEditorTab("general");
    setPlayers(null);
    setLinkRevealed(false);
    setModuleError(null);
    const full = await api.getExperienceFull(exp.id);
    setFullExperience(full);
  };

  const openTab = async (tab) => {
    setEditorTab(tab);
    if (tab === "respuestas") {
      const data = await api.getPlayers(selectedExp.id);
      setPlayers(data);
    }
  };

  const createExperience = async () => {
    try {
      const slug = randomSlug();
      const exp = await api.createExperience({
        title: "Nueva experiencia",
        slug,
        theme_color: "#ff2d4f",
        description: "",
        reward_threshold: 15,
      });
      setExperiences((prev) => [...prev, exp]);
      selectExperience(exp);
    } catch (e) {
      setLoadError(e.message);
    }
  };

  const handleDeleteFromList = async (exp) => {
    if (!confirm(t("dashboardPage.confirmDeleteExperience").replace("{title}", exp.title))) return;
    try {
      await api.deleteExperience(exp.id);
      setExperiences((prev) => prev.filter((e) => e.id !== exp.id));
      if (selectedExp?.id === exp.id) {
        setSelectedExp(null);
        setFullExperience(null);
        setView("list");
        dirtyModuleIdsRef.current.clear();
        setDirty(false);
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("quilt_token");
    clearApiCache();
    navigate("/login", { replace: true });
  };

  // ---- experience field + module edits: staged locally, persisted only on "Guardar cambios" ----
  const patchExperienceField = (field, value) => {
    setFullExperience((prev) => (prev ? { ...prev, [field]: value } : prev));
    setSelectedExp((prev) => (prev ? { ...prev, [field]: value } : prev));
    setDirty(true);
  };

  const saveChanges = async () => {
    if (!fullExperience) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await api.updateExperience(fullExperience.id, {
        title: fullExperience.title,
        description: fullExperience.description,
        welcome_message: fullExperience.welcome_message,
        theme_color: fullExperience.theme_color,
        reward_threshold: fullExperience.reward_threshold,
        spend_points_on_claim: fullExperience.spend_points_on_claim,
        status: fullExperience.status,
      });
      setExperiences((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setSelectedExp((prev) => (prev ? { ...prev, ...updated } : prev));

      for (const moduleId of dirtyModuleIdsRef.current) {
        const mod = fullExperience.modules.find((m) => m.id === moduleId);
        if (!mod) continue;
        if (mod.type === "question") {
          await api.updateModule(mod.id, {
            questions: mod.questions.map((q) => ({
              prompt: q.prompt,
              points: q.points,
              repeatable: q.repeatable,
              input_type: q.input_type,
              options: q.input_type === "multiple_choice" ? q.options ?? [] : null,
              image_id: q.image_id ?? null,
            })),
          });
        } else if (mod.type === "reward_picker") {
          await api.updateModule(mod.id, {
            reward_options: mod.reward_options.map((r) => ({
              id: r.id,
              label: r.label,
              description: r.description,
              icon: r.icon,
              unlock_points: r.unlock_points,
              requires_datetime: r.requires_datetime,
              one_per_player: r.one_per_player,
            })),
            custom_reward_limit: mod.custom_reward_limit,
            custom_reward_unlock_points: mod.custom_reward_unlock_points,
          });
        }
      }
      dirtyModuleIdsRef.current.clear();
      setDirty(false);
      await refreshFullExperience(fullExperience.id);
    } catch (e) {
      setSaveError(e.message);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const updateQuestionField = (moduleId, qIndex, field, value) => {
    setModuleError(null);
    setFullExperience((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id !== moduleId ? m : { ...m, questions: m.questions.map((q, i) => (i !== qIndex ? q : { ...q, [field]: value })) },
      ),
    }));
    dirtyModuleIdsRef.current.add(moduleId);
    setDirty(true);
  };

  const deleteQuestionRow = async (moduleId, qIndex) => {
    setModuleError(null);
    const mod = fullExperience.modules.find((m) => m.id === moduleId);
    const remaining = mod.questions.filter((_, i) => i !== qIndex);
    if (remaining.length === 0) {
      setFullExperience((prev) => ({ ...prev, modules: prev.modules.filter((m) => m.id !== moduleId) }));
      try {
        await api.deleteModule(moduleId);
      } catch (e) {
        setModuleError(e.message);
        refreshFullExperience();
      }
      return;
    }
    setFullExperience((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => (m.id !== moduleId ? m : { ...m, questions: remaining })),
    }));
    dirtyModuleIdsRef.current.delete(moduleId);
    try {
      await api.updateModule(moduleId, {
        questions: remaining.map((q) => ({
          prompt: q.prompt,
          points: q.points,
          repeatable: q.repeatable,
          input_type: q.input_type,
          options: q.input_type === "multiple_choice" ? q.options ?? [] : null,
          image_id: q.image_id ?? null,
        })),
      });
    } catch (e) {
      setModuleError(e.message);
    }
  };

  const addQuestion = async (type) => {
    setModuleError(null);
    if (dirty) {
      try {
        await saveChanges();
      } catch (e) {
        setModuleError(e.message);
        return;
      }
    }
    const question = {
      prompt: "",
      points: 10,
      repeatable: false,
      input_type: type,
      options: type === "multiple_choice" ? ["", ""] : null,
      image_id: null,
    };
    try {
      const questionModulesCount = fullExperience.modules.filter((m) => m.type === "question").length;
      await api.createModule(fullExperience.id, {
        type: "question",
        order_index: questionModulesCount,
        questions: [question],
        reward_options: [],
      });
      await refreshFullExperience();
    } catch (e) {
      setModuleError(e.message);
    }
  };

  const addOption = (moduleId, qIndex) => {
    const mod = fullExperience.modules.find((m) => m.id === moduleId);
    const q = mod.questions[qIndex];
    updateQuestionField(moduleId, qIndex, "options", [...(q.options ?? []), ""]);
  };

  const updateOption = (moduleId, qIndex, oIndex, value) => {
    const mod = fullExperience.modules.find((m) => m.id === moduleId);
    const q = mod.questions[qIndex];
    const options = [...q.options];
    options[oIndex] = value;
    updateQuestionField(moduleId, qIndex, "options", options);
  };

  const removeOption = (moduleId, qIndex, oIndex) => {
    const mod = fullExperience.modules.find((m) => m.id === moduleId);
    const q = mod.questions[qIndex];
    updateQuestionField(
      moduleId,
      qIndex,
      "options",
      q.options.filter((_, i) => i !== oIndex),
    );
  };

  const handleImageSelect = async (moduleId, qIndex, file) => {
    if (!file) return;
    setModuleError(null);
    try {
      const { id, url } = await api.uploadImage(file);
      updateQuestionField(moduleId, qIndex, "image_id", id);
      setFullExperience((prev) => ({
        ...prev,
        modules: prev.modules.map((m) =>
          m.id !== moduleId ? m : { ...m, questions: m.questions.map((q, i) => (i !== qIndex ? q : { ...q, image_url: url })) },
        ),
      }));
    } catch (e) {
      setModuleError(e.message);
    }
  };

  const handleImageRemove = async (moduleId, qIndex) => {
    const mod = fullExperience.modules.find((m) => m.id === moduleId);
    const q = mod.questions[qIndex];
    if (q.image_id) {
      try {
        await api.deleteImage(q.image_id);
      } catch (e) {
        setModuleError(e.message);
      }
    }
    updateQuestionField(moduleId, qIndex, "image_id", null);
    setFullExperience((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id !== moduleId ? m : { ...m, questions: m.questions.map((qq, i) => (i !== qIndex ? qq : { ...qq, image_url: null })) },
      ),
    }));
  };

  // ---- rewards ----
  const rewardModule = fullExperience?.modules.find((m) => m.type === "reward_picker") ?? null;

  const updateRewardField = (moduleId, rIndex, field, value) => {
    setFullExperience((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id !== moduleId ? m : { ...m, reward_options: m.reward_options.map((r, i) => (i !== rIndex ? r : { ...r, [field]: value })) },
      ),
    }));
    dirtyModuleIdsRef.current.add(moduleId);
    setDirty(true);
  };

  const addReward = async () => {
    setModuleError(null);
    if (dirty) {
      try {
        await saveChanges();
      } catch (e) {
        setModuleError(e.message);
        return;
      }
    }
    const reward = { label: "", description: "", icon: "🎁", unlock_points: 10, requires_datetime: false, one_per_player: false };
    try {
      if (rewardModule) {
        const rewardOptions = [...rewardModule.reward_options, reward];
        await api.updateModule(rewardModule.id, {
          reward_options: rewardOptions.map((r) => ({
            id: r.id,
            label: r.label,
            description: r.description,
            icon: r.icon,
            unlock_points: r.unlock_points,
            requires_datetime: r.requires_datetime,
            one_per_player: r.one_per_player,
          })),
        });
      } else {
        const modulesCount = fullExperience.modules.length;
        await api.createModule(fullExperience.id, {
          type: "reward_picker",
          order_index: modulesCount,
          questions: [],
          reward_options: [reward],
        });
      }
      await refreshFullExperience();
    } catch (e) {
      setModuleError(e.message);
    }
  };

  const deleteReward = async (moduleId, rIndex) => {
    if (!confirm(t("dashboardPage.confirmDeleteReward"))) return;
    const mod = fullExperience.modules.find((m) => m.id === moduleId);
    const remaining = mod.reward_options.filter((_, i) => i !== rIndex);
    setFullExperience((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => (m.id !== moduleId ? m : { ...m, reward_options: remaining })),
    }));
    try {
      await api.updateModule(moduleId, {
        reward_options: remaining.map((r) => ({
          id: r.id,
          label: r.label,
          description: r.description,
          icon: r.icon,
          unlock_points: r.unlock_points,
          requires_datetime: r.requires_datetime,
          one_per_player: r.one_per_player,
        })),
      });
      dirtyModuleIdsRef.current.delete(moduleId);
    } catch (e) {
      setModuleError(e.message);
    }
  };

  const toggleCustomReward = () => {
    if (!rewardModule) return;
    const enabled = rewardModule.custom_reward_limit != null;
    const newLimit = enabled ? null : 1;
    setFullExperience((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => (m.id !== rewardModule.id ? m : { ...m, custom_reward_limit: newLimit })),
    }));
    dirtyModuleIdsRef.current.add(rewardModule.id);
    setDirty(true);
  };

  const updateCustomRewardConfig = (field, value) => {
    if (!rewardModule) return;
    const moduleId = rewardModule.id;
    setFullExperience((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => (m.id !== moduleId ? m : { ...m, [field]: value })),
    }));
    dirtyModuleIdsRef.current.add(moduleId);
    setDirty(true);
  };

  const handleDeletePhoto = async (playerId, answerId, imageId) => {
    if (!confirm(t("dashboardPage.confirmDeletePhoto"))) return;
    try {
      await api.deleteImage(imageId);
      setPlayers((prev) =>
        prev.map((p) =>
          p.id !== playerId
            ? p
            : { ...p, answers: p.answers.map((a) => (a.id !== answerId ? a : { ...a, response_image_url: null })) },
        ),
      );
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteAnswer = async (playerId, answerId) => {
    if (!confirm(t("dashboardPage.confirmDeleteAnswer"))) return;
    try {
      const res = await api.deleteAnswer(playerId, answerId);
      setPlayers((prev) =>
        prev.map((p) =>
          p.id !== playerId
            ? p
            : { ...p, total_points: res.total_points, answers: p.answers.filter((a) => a.id !== answerId) },
        ),
      );
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteAllAnswers = async (playerId) => {
    if (!confirm(t("dashboardPage.confirmDeleteAllAnswers"))) return;
    try {
      const res = await api.deleteAllAnswers(playerId);
      setPlayers((prev) =>
        prev.map((p) => (p.id !== playerId ? p : { ...p, total_points: res.total_points, answers: [] })),
      );
    } catch (e) {
      alert(e.message);
    }
  };

  const link = selectedExp ? `${window.location.origin}/play/${selectedExp.slug}` : "";

  const copyToClipboard = async (text) => {
    if (window.isSecureContext && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // sigue al fallback
      }
    }
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  };

  const copyLink = async () => {
    if (await copyToClipboard(link)) {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1500);
    } else {
      alert(t("dashboardPage.copyFailed"));
    }
  };
  const copyCode = async () => {
    if (await copyToClipboard(selectedExp?.slug || "")) {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 1500);
    } else {
      alert(t("dashboardPage.copyFailed"));
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#e9e9ed", fontFamily: "Inter,system-ui,sans-serif", position: "relative" }}>
      <SiteBackground />
      {/* TOPBAR */}
      <div style={{ position: "relative", zIndex: 30, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12, padding: "14px 28px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(23,18,20,0.55)", backdropFilter: "blur(12px)" }}>
        <Logo style={{ marginRight: "auto" }} />
        <div
          onClick={() => confirmDiscardIfDirty() && setView("account")}
          style={{ fontSize: 13, color: "rgba(233,233,237,0.7)", cursor: "pointer", textDecoration: "underline", textDecorationColor: "rgba(233,233,237,0.25)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {creator?.display_name || creator?.email}
        </div>
        <div style={{ position: "relative" }}>
          <div
            onClick={() => setLangOpen(!langOpen)}
            style={{ height: 30, padding: "0 10px", borderRadius: 8, border: "1px solid rgba(233,233,237,0.16)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 12 }}
          >
            <span>{language.toUpperCase()}</span>
            <i className="fa-solid fa-chevron-down" style={{ fontSize: 8, color: "rgba(233,233,237,0.55)" }} />
          </div>
          {langOpen && (
            <div style={{ position: "absolute", top: 38, right: 0, background: "#171217", border: "1px solid rgba(233,233,237,0.12)", borderRadius: 10, padding: 6, display: "flex", flexDirection: "column", gap: 2, minWidth: 88, boxShadow: "0 12px 32px rgba(0,0,0,0.5)", zIndex: 20 }}>
              <div
                onClick={() => {
                  setLanguage("es");
                  setLangOpen(false);
                }}
                style={{ padding: "7px 10px", borderRadius: 6, fontSize: 13, cursor: "pointer", background: language === "es" ? "rgba(255,45,79,0.16)" : "transparent", color: language === "es" ? "#ffb3c0" : "#e9e9ed" }}
              >
                ES · Español
              </div>
              <div
                onClick={() => {
                  setLanguage("en");
                  setLangOpen(false);
                }}
                style={{ padding: "7px 10px", borderRadius: 6, fontSize: 13, cursor: "pointer", background: language === "en" ? "rgba(255,45,79,0.16)" : "transparent", color: language === "en" ? "#ffb3c0" : "#e9e9ed" }}
              >
                EN · English
              </div>
            </div>
          )}
        </div>
        <div onClick={() => confirmDiscardIfDirty() && handleLogout()} style={{ fontSize: 13, color: "rgba(233,233,237,0.55)", cursor: "pointer" }}>
          {t("dashboardPage.logout")}
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "36px 24px" }}>
        {loadError && <p style={{ color: "#ff2d4f", fontSize: 13, marginBottom: 16 }}>{t("dashboardPage.loadErrorPrefix")} {loadError}</p>}
        {reactivatedNotice && (
          <div style={{ background: "rgba(255,45,79,0.1)", border: "1px solid rgba(255,45,79,0.35)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#ffb3c0", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span>{t("account.reactivatedMessage")}</span>
            <i onClick={() => setReactivatedNotice(false)} className="fa-solid fa-xmark" style={{ cursor: "pointer" }} />
          </div>
        )}

        {/* ACCOUNT VIEW */}
        {view === "account" && (
          <AccountView
            creator={creator}
            onBack={() => setView("list")}
            onNameSaved={(name) => setCreator((prev) => (prev ? { ...prev, display_name: name } : prev))}
            onLoggedOut={handleLogout}
          />
        )}

        {/* LIST VIEW */}
        {view === "list" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 24 }}>{t("dashboardPage.yourExperiences")}</div>
              <div
                onClick={createExperience}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 13, color: "#ffb3c0", background: "rgba(255,45,79,0.16)", border: "1.5px solid #ff2d4f", borderRadius: 9, padding: "10px 18px", cursor: "pointer" }}
              >
                {t("dashboardPage.newExperience")}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
              {experiences.map((exp) => {
                const st = STATUS_STYLES[exp.status] ?? STATUS_STYLES.draft;
                const statusLabel = exp.status === "published" ? t("dashboardPage.active") : t("dashboardPage.inactive");
                const s = stats[exp.id];
                return (
                  <div key={exp.id} style={{ background: "rgba(255,255,255,0.22)", backdropFilter: "blur(28px) saturate(160%)", WebkitBackdropFilter: "blur(28px) saturate(160%)", border: "1px solid rgba(255,255,255,0.34)", boxShadow: "0 8px 32px rgba(0,0,0,0.35)", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div onClick={() => selectExperience(exp)} style={{ cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 16 }}>{exp.title}</div>
                        <div style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, background: st.bg, color: st.color }}>{statusLabel}</div>
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(233,233,237,0.55)", marginTop: 10 }}>
                        {s ? `${s.plays} ${t("dashboardPage.plays")} · ${s.moduleCount} ${t("dashboardPage.modulesWord")}` : t("dashboardPage.loadingStats")}
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <i
                        onClick={() => handleDeleteFromList(exp)}
                        className="fa-solid fa-trash"
                        style={{ color: "rgba(233,233,237,0.4)", fontSize: 13, cursor: "pointer", padding: 4 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* EDITOR VIEW */}
        {view === "editor" && selectedExp && (
          <div
            style={(() => {
              const gem = fullExperience?.theme_color || selectedExp.theme_color || "#ff2d4f";
              return {
                "--color-gem": gem,
                "--color-gem-light": lightenHex(gem, 0.64),
                "--color-gem-dark": darkenHex(gem, 0.22),
              };
            })()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div
                onClick={() => {
                  if (!confirmDiscardIfDirty()) return;
                  dirtyModuleIdsRef.current.clear();
                  setDirty(false);
                  setSaveError(null);
                  setView("list");
                }}
                style={{ fontSize: 13, color: "rgba(233,233,237,0.6)", cursor: "pointer" }}
              >
                <i className="fa-solid fa-arrow-left" /> {t("dashboardPage.backToList")}
              </div>
            </div>
            <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 24, marginBottom: 18 }}>{selectedExp.title}</div>

            <div style={{ display: "flex", gap: 4, borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 24, overflowX: "auto" }}>
              {TABS.map((tabKey) => (
                <div
                  key={tabKey}
                  onClick={() => openTab(tabKey)}
                  style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flex: "none", color: editorTab === tabKey ? "var(--color-gem-light)" : "rgba(233,233,237,0.55)", borderBottom: `2px solid ${editorTab === tabKey ? "var(--color-gem)" : "transparent"}` }}
                >
                  {t(`dashboardPage.${TAB_LABEL_KEY[tabKey]}`)}
                </div>
              ))}
            </div>

            {dirty && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "rgba(255,45,79,0.1)", border: "1px solid rgba(255,45,79,0.35)", borderRadius: 10, padding: "10px 14px", marginBottom: 20 }}>
                <span style={{ fontSize: 13, color: "#ffb3c0" }}>{t("dashboardPage.unsavedChanges")}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {saveError && <span style={{ fontSize: 12, color: "#ff2d4f" }}>{saveError}</span>}
                  <div
                    onClick={saving ? undefined : saveChanges}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 13, color: "#fff", background: "#ff2d4f", borderRadius: 8, padding: "8px 16px", cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1, whiteSpace: "nowrap" }}
                  >
                    {saving ? t("dashboardPage.saving") : t("dashboardPage.saveChanges")}
                  </div>
                </div>
              </div>
            )}

            {fullExperience && editorTab === "general" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 440 }}>
                <div>
                  <label style={fieldLabel}>{t("dashboardPage.fieldName")}</label>
                  <input
                    type="text"
                    value={fullExperience.title}
                    onChange={(e) => patchExperienceField("title", e.target.value)}
                    style={fieldInput}
                  />
                </div>

                <div style={{ position: "relative" }}>
                  <label style={fieldLabel}>{t("dashboardPage.fieldColor")}</label>
                  <ColorPickerButton value={fullExperience.theme_color || "#ff2d4f"} onChange={(c) => patchExperienceField("theme_color", c)} />
                </div>

                <div>
                  <label style={fieldLabel}>{t("dashboardPage.fieldDescription")}</label>
                  <textarea
                    value={fullExperience.description || ""}
                    onChange={(e) => patchExperienceField("description", e.target.value)}
                    placeholder={t("dashboardPage.descriptionPlaceholder")}
                    style={{ width: "100%", height: 70, resize: "none", padding: "10px 12px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.14)", color: "#e9e9ed", fontSize: 14, fontFamily: "Inter,system-ui,sans-serif" }}
                  />
                </div>

                <div>
                  <label style={fieldLabel}>{t("dashboardPage.fieldWelcomeMessage")}</label>
                  <input
                    type="text"
                    value={fullExperience.welcome_message || ""}
                    onChange={(e) => patchExperienceField("welcome_message", e.target.value)}
                    placeholder={t("playApp.readyQuestion")}
                    style={fieldInput}
                  />
                </div>

                <div>
                  <label style={fieldLabel}>{t("dashboardPage.fieldCode")}</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.22)", backdropFilter: "blur(28px) saturate(160%)", WebkitBackdropFilter: "blur(28px) saturate(160%)", border: "1px solid rgba(255,255,255,0.34)", boxShadow: "0 8px 32px rgba(0,0,0,0.35)", borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ flex: 1, fontSize: 13, fontFamily: "monospace", letterSpacing: "0.02em" }}>
                      {linkRevealed ? selectedExp.slug : "••••••••••••"}
                    </div>
                    <i
                      onClick={() => setLinkRevealed(!linkRevealed)}
                      className={`fa-solid ${linkRevealed ? "fa-eye-slash" : "fa-eye"}`}
                      style={{ cursor: "pointer", color: "rgba(233,233,237,0.6)" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={fieldLabel}>{t("dashboardPage.fieldRewardThreshold")}</label>
                  <input
                    type="number"
                    value={fullExperience.reward_threshold}
                    onChange={(e) => patchExperienceField("reward_threshold", parseInt(e.target.value) || 0)}
                    style={{ width: 120, height: 42, padding: "0 12px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.14)", color: "#e9e9ed", fontSize: 14, fontFamily: "Inter,system-ui,sans-serif" }}
                  />
                  <div style={{ fontSize: 11, color: "rgba(233,233,237,0.5)", marginTop: 6 }}>
                    {t("dashboardPage.rewardThresholdHint")}
                  </div>
                </div>

                <div
                  onClick={() => patchExperienceField("spend_points_on_claim", !fullExperience.spend_points_on_claim)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 10, background: "rgba(255,255,255,0.22)", backdropFilter: "blur(28px) saturate(160%)", WebkitBackdropFilter: "blur(28px) saturate(160%)", border: "1px solid rgba(255,255,255,0.34)", boxShadow: "0 8px 32px rgba(0,0,0,0.35)", cursor: "pointer" }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{t("dashboardPage.spendPointsTitle")}</div>
                    <div style={{ fontSize: 12, color: "rgba(233,233,237,0.55)", marginTop: 2 }}>{t("dashboardPage.spendPointsSub")}</div>
                  </div>
                  <div style={{ width: 38, height: 22, borderRadius: 11, background: fullExperience.spend_points_on_claim ? "var(--color-gem)" : "rgba(255,255,255,0.15)", position: "relative", flex: "none" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: fullExperience.spend_points_on_claim ? 19 : 3, transition: "left 0.2s ease" }} />
                  </div>
                </div>

                <div
                  onClick={() => patchExperienceField("status", fullExperience.status === "published" ? "draft" : "published")}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 10, background: "rgba(255,255,255,0.22)", backdropFilter: "blur(28px) saturate(160%)", WebkitBackdropFilter: "blur(28px) saturate(160%)", border: "1px solid rgba(255,255,255,0.34)", boxShadow: "0 8px 32px rgba(0,0,0,0.35)", cursor: "pointer" }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{t("dashboardPage.activeToggleTitle")}</div>
                    <div style={{ fontSize: 12, color: "rgba(233,233,237,0.55)", marginTop: 2 }}>{t("dashboardPage.activeToggleSub")}</div>
                  </div>
                  <div style={{ width: 38, height: 22, borderRadius: 11, background: fullExperience.status === "published" ? "var(--color-gem)" : "rgba(255,255,255,0.15)", position: "relative", flex: "none" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: fullExperience.status === "published" ? 19 : 3, transition: "left 0.2s ease" }} />
                  </div>
                </div>
              </div>
            )}

            {fullExperience && editorTab === "modulos" && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  {moduleError && <p style={{ color: "#ff2d4f", fontSize: 13 }}>{moduleError}</p>}
                  {fullExperience.modules
                    .filter((m) => m.type === "question")
                    .flatMap((m) => m.questions.map((q, qIndex) => ({ m, q, qIndex })))
                    .map(({ m, q, qIndex }) => (
                      <div key={`${m.id}-${qIndex}`}>
                        <div style={rowShell}>
                          <GripIcon />
                          <i className={QUESTION_TYPE_ICON(q.input_type)} style={typeIcon} />
                          <input
                            type="text"
                            value={q.prompt}
                            onChange={(e) => updateQuestionField(m.id, qIndex, "prompt", e.target.value)}
                            placeholder={defaultPromptFor(q.input_type, t)}
                            style={rowInput}
                          />
                          <input
                            type="number"
                            value={q.points}
                            onChange={(e) => updateQuestionField(m.id, qIndex, "points", parseInt(e.target.value) || 0)}
                            style={pointsInput}
                          />
                          <div style={{ fontSize: 11, color: "rgba(233,233,237,0.5)" }}>{t("dashboardPage.pointsLabel")}</div>
                          <i
                            onClick={() => deleteQuestionRow(m.id, qIndex)}
                            className="fa-solid fa-trash"
                            style={{ color: "rgba(233,233,237,0.4)", fontSize: 13, cursor: "pointer" }}
                          />
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: "8px 14px 0 44px", fontSize: 11, color: "rgba(233,233,237,0.5)" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={q.repeatable}
                              onChange={(e) => updateQuestionField(m.id, qIndex, "repeatable", e.target.checked)}
                            />
                            {t("dashboardPage.repeatableLabel")}
                          </label>
                          {q.image_url ? (
                            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <img src={resolveImageUrl(q.image_url)} alt="" style={{ width: 22, height: 22, objectFit: "cover", borderRadius: 4, border: "1px solid rgba(255,255,255,0.2)" }} />
                              <span onClick={() => handleImageRemove(m.id, qIndex)} style={{ color: "#ff2d4f", cursor: "pointer", textDecoration: "underline" }}>
                                {t("dashboardPage.removeImage")}
                              </span>
                            </span>
                          ) : (
                            <label style={{ cursor: "pointer" }}>
                              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImageSelect(m.id, qIndex, e.target.files?.[0])} />
                              <span style={{ color: "var(--color-gem-light)", textDecoration: "underline" }}>{t("dashboardPage.addImage")}</span>
                            </label>
                          )}
                        </div>

                        {q.input_type === "multiple_choice" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "8px 14px 4px 44px" }}>
                            {(q.options ?? []).map((opt, oIndex) => (
                              <div key={oIndex} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <input
                                  value={opt}
                                  onChange={(e) => updateOption(m.id, qIndex, oIndex, e.target.value)}
                                  placeholder={t("dashboardPage.optionPlaceholder").replace("{n}", oIndex + 1)}
                                  style={{ flex: 1, height: 30, padding: "0 10px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "#e9e9ed", fontSize: 12 }}
                                />
                                {q.options.length > 2 && (
                                  <span onClick={() => removeOption(m.id, qIndex, oIndex)} style={{ fontSize: 11, color: "#ff2d4f", cursor: "pointer" }}>
                                    {t("dashboardPage.removeOption")}
                                  </span>
                                )}
                              </div>
                            ))}
                            <span onClick={() => addOption(m.id, qIndex)} style={{ fontSize: 11, color: "var(--color-gem-light)", textDecoration: "underline", cursor: "pointer" }}>
                              {t("dashboardPage.addOption")}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <div onClick={() => addQuestion("multiple_choice")} style={addPill}>
                    <i className="fa-solid fa-list-check" /> {t("dashboardPage.addQuestionMultiple")}
                  </div>
                  <div onClick={() => addQuestion("text")} style={addPill}>
                    <i className="fa-solid fa-align-left" /> {t("dashboardPage.addQuestionText")}
                  </div>
                  <div onClick={() => addQuestion("photo")} style={addPill}>
                    <i className="fa-solid fa-camera" /> {t("dashboardPage.addQuestionPhoto")}
                  </div>
                </div>
              </>
            )}

            {fullExperience && editorTab === "recompensas" && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                  {moduleError && <p style={{ color: "#ff2d4f", fontSize: 13 }}>{moduleError}</p>}
                  {(rewardModule?.reward_options ?? []).map((r, rIndex) => (
                    <div key={rIndex} style={{ ...rowShell, flexDirection: "column", alignItems: "stretch", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                        <GripIcon />
                        <EmojiPickerButton
                          value={r.icon}
                          onChange={(v) => updateRewardField(rewardModule.id, rIndex, "icon", v)}
                        />
                        <input
                          value={r.label}
                          onChange={(e) => updateRewardField(rewardModule.id, rIndex, "label", e.target.value)}
                          placeholder={t("dashboardPage.rewardNamePlaceholder")}
                          style={rowInput}
                        />
                        <div style={{ fontSize: 11, color: "rgba(233,233,237,0.5)" }}>{t("dashboardPage.rewardFrom")}</div>
                        <input
                          type="number"
                          value={r.unlock_points ?? ""}
                          onChange={(e) => updateRewardField(rewardModule.id, rIndex, "unlock_points", e.target.value === "" ? null : parseInt(e.target.value))}
                          style={pointsInput}
                        />
                        <div style={{ fontSize: 11, color: "rgba(233,233,237,0.5)" }}>{t("dashboardPage.rewardPts")}</div>
                        <div
                          onClick={() => updateRewardField(rewardModule.id, rIndex, "requires_datetime", !r.requires_datetime)}
                          style={{ fontSize: 11, padding: "6px 10px", borderRadius: 6, cursor: "pointer", background: r.requires_datetime ? "color-mix(in srgb, var(--color-gem) 18%, transparent)" : "rgba(255,255,255,0.06)", color: r.requires_datetime ? "var(--color-gem-light)" : "rgba(233,233,237,0.5)", whiteSpace: "nowrap" }}
                        >
                          <i className="fa-solid fa-calendar" /> {t("dashboardPage.rewardDateToggle")}
                        </div>
                        <div
                          onClick={() => updateRewardField(rewardModule.id, rIndex, "one_per_player", !r.one_per_player)}
                          style={{ fontSize: 11, padding: "6px 10px", borderRadius: 6, cursor: "pointer", background: r.one_per_player ? "color-mix(in srgb, var(--color-gem) 18%, transparent)" : "rgba(255,255,255,0.06)", color: r.one_per_player ? "var(--color-gem-light)" : "rgba(233,233,237,0.5)", whiteSpace: "nowrap" }}
                        >
                          <i className="fa-solid fa-user-check" /> {t("dashboardPage.rewardOnePerPlayerToggle")}
                        </div>
                        <i
                          onClick={() => deleteReward(rewardModule.id, rIndex)}
                          className="fa-solid fa-trash"
                          style={{ color: "rgba(233,233,237,0.4)", fontSize: 13, cursor: "pointer" }}
                        />
                      </div>
                      <input
                        value={r.description || ""}
                        onChange={(e) => updateRewardField(rewardModule.id, rIndex, "description", e.target.value)}
                        placeholder={t("dashboardPage.rewardDescPlaceholder")}
                        style={{ ...rowInput, paddingLeft: 44 }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  <div onClick={addReward} style={addPill}>
                    {t("dashboardPage.addReward")}
                  </div>
                </div>
                <div
                  onClick={toggleCustomReward}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 10, background: "rgba(255,255,255,0.22)", backdropFilter: "blur(28px) saturate(160%)", WebkitBackdropFilter: "blur(28px) saturate(160%)", border: "1px solid rgba(255,255,255,0.34)", boxShadow: "0 8px 32px rgba(0,0,0,0.35)", cursor: rewardModule ? "pointer" : "not-allowed", opacity: rewardModule ? 1 : 0.5 }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{t("dashboardPage.customRewardTitle")}</div>
                    <div style={{ fontSize: 12, color: "rgba(233,233,237,0.55)", marginTop: 2 }}>{t("dashboardPage.customRewardSub")}</div>
                  </div>
                  <div style={{ width: 38, height: 22, borderRadius: 11, background: rewardModule?.custom_reward_limit != null ? "var(--color-gem)" : "rgba(255,255,255,0.15)", position: "relative", flex: "none" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: rewardModule?.custom_reward_limit != null ? 19 : 3, transition: "left 0.2s ease" }} />
                  </div>
                </div>

                {rewardModule?.custom_reward_limit != null && (
                  <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
                    <div>
                      <label style={fieldLabel}>{t("dashboardPage.customRewardLimitLabel")}</label>
                      <input
                        type="number"
                        min={1}
                        value={rewardModule.custom_reward_limit}
                        onChange={(e) => updateCustomRewardConfig("custom_reward_limit", Math.max(1, parseInt(e.target.value) || 1))}
                        style={{ width: 100, height: 38, padding: "0 12px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.14)", color: "#e9e9ed", fontSize: 14, fontFamily: "Inter,system-ui,sans-serif" }}
                      />
                    </div>
                    <div>
                      <label style={fieldLabel}>{t("dashboardPage.customRewardPointsLabel")}</label>
                      <input
                        type="number"
                        value={rewardModule.custom_reward_unlock_points ?? ""}
                        placeholder={String(fullExperience.reward_threshold)}
                        onChange={(e) =>
                          updateCustomRewardConfig(
                            "custom_reward_unlock_points",
                            e.target.value === "" ? null : parseInt(e.target.value),
                          )
                        }
                        style={{ width: 140, height: 38, padding: "0 12px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.14)", color: "#e9e9ed", fontSize: 14, fontFamily: "Inter,system-ui,sans-serif" }}
                      />
                      <div style={{ fontSize: 11, color: "rgba(233,233,237,0.5)", marginTop: 6 }}>{t("dashboardPage.customRewardPointsHint")}</div>
                    </div>
                  </div>
                )}
              </>
            )}

            {fullExperience && editorTab === "compartir" && (
              <div style={{ maxWidth: 440, display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <div style={{ fontSize: 13, color: "rgba(233,233,237,0.6)", marginBottom: 8 }}>{t("dashboardPage.shareLinkLabel")}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.22)", backdropFilter: "blur(28px) saturate(160%)", WebkitBackdropFilter: "blur(28px) saturate(160%)", border: "1px solid rgba(255,255,255,0.34)", boxShadow: "0 8px 32px rgba(0,0,0,0.35)", borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ flex: 1, fontSize: 13, fontFamily: "monospace", letterSpacing: "0.02em", color: "#e9e9ed", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {linkRevealed ? link : "••••••••••••••••••"}
                    </div>
                    <i
                      onClick={() => setLinkRevealed(!linkRevealed)}
                      className={`fa-solid ${linkRevealed ? "fa-eye-slash" : "fa-eye"}`}
                      style={{ cursor: "pointer", color: "rgba(233,233,237,0.6)" }}
                    />
                    <div onClick={copyLink} style={{ fontSize: 12, fontWeight: 600, color: "var(--color-gem-light)", cursor: "pointer", whiteSpace: "nowrap" }}>
                      {linkCopied ? t("dashboardPage.copied") : t("dashboardPage.copy")}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 13, color: "rgba(233,233,237,0.6)", marginBottom: 8 }}>{t("dashboardPage.shareCodeLabel")}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.22)", backdropFilter: "blur(28px) saturate(160%)", WebkitBackdropFilter: "blur(28px) saturate(160%)", border: "1px solid rgba(255,255,255,0.34)", boxShadow: "0 8px 32px rgba(0,0,0,0.35)", borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ flex: 1, fontSize: 13, fontFamily: "monospace", letterSpacing: "0.02em", color: "#e9e9ed", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {linkRevealed ? selectedExp.slug : "••••••••••••"}
                    </div>
                    <i
                      onClick={() => setLinkRevealed(!linkRevealed)}
                      className={`fa-solid ${linkRevealed ? "fa-eye-slash" : "fa-eye"}`}
                      style={{ cursor: "pointer", color: "rgba(233,233,237,0.6)" }}
                    />
                    <div onClick={copyCode} style={{ fontSize: 12, fontWeight: 600, color: "var(--color-gem-light)", cursor: "pointer", whiteSpace: "nowrap" }}>
                      {codeCopied ? t("dashboardPage.copied") : t("dashboardPage.copy")}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {editorTab === "respuestas" && (
              <>
                {players === null && <p style={{ color: "rgba(233,233,237,0.5)", fontSize: 13 }}>{t("dashboardPage.answersLoading")}</p>}
                {players?.length === 0 && (
                  <p style={{ color: "rgba(233,233,237,0.5)", fontSize: 13, padding: "20px 0" }}>{t("dashboardPage.answersEmpty")}</p>
                )}
                {players?.map((p, i) => (
                  <div
                    key={p.id}
                    onClick={() => setExpandedPlayer(expandedPlayer === p.id ? null : p.id)}
                    style={{ display: "flex", flexDirection: "column", borderBottom: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 4px" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: AVATAR_PALETTE[i % 3].bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: AVATAR_PALETTE[i % 3].color, flex: "none" }}>
                        {p.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                      <i className={`fa-solid ${expandedPlayer === p.id ? "fa-chevron-up" : "fa-chevron-down"}`} style={{ color: "rgba(233,233,237,0.4)", fontSize: 12 }} />
                    </div>
                    {expandedPlayer === p.id && (
                      <div style={{ padding: "0 4px 16px 46px", display: "flex", flexDirection: "column", gap: 10 }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12 }}>
                          <div style={{ color: "rgba(233,233,237,0.6)" }}>{p.total_points} {t("dashboardPage.pointsLabel")}</div>
                          <div style={{ color: "var(--color-gem-light)" }}>{t("dashboardPage.rewardChosenLabel")} {p.reward_chosen || t("dashboardPage.noRewardChosen")}</div>
                          {p.answers.length > 0 && (
                            <div
                              onClick={() => handleDeleteAllAnswers(p.id)}
                              style={{ marginLeft: "auto", fontSize: 11, color: "#ff2d4f", textDecoration: "underline", cursor: "pointer", whiteSpace: "nowrap" }}
                            >
                              {t("dashboardPage.deleteAllAnswers")}
                            </div>
                          )}
                        </div>
                        {p.answers.map((a) => (
                          <div key={a.id} style={{ background: "rgba(255,255,255,0.22)", backdropFilter: "blur(28px) saturate(160%)", WebkitBackdropFilter: "blur(28px) saturate(160%)", border: "1px solid rgba(255,255,255,0.34)", boxShadow: "0 8px 32px rgba(0,0,0,0.35)", borderRadius: 8, padding: "10px 12px" }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                              <div style={{ fontSize: 11, color: "rgba(233,233,237,0.5)" }}>{a.prompt}</div>
                              <i
                                onClick={() => handleDeleteAnswer(p.id, a.id)}
                                className="fa-solid fa-trash"
                                style={{ color: "rgba(233,233,237,0.4)", fontSize: 12, cursor: "pointer", flex: "none" }}
                              />
                            </div>
                            {a.response_image_url ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                                <img src={resolveImageUrl(a.response_image_url)} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)" }} />
                                <span
                                  onClick={() => handleDeletePhoto(p.id, a.id, a.response_image_id)}
                                  style={{ fontSize: 11, color: "#ff2d4f", textDecoration: "underline", cursor: "pointer" }}
                                >
                                  {t("dashboardPage.deletePhotoLink")}
                                </span>
                              </div>
                            ) : (
                              <div style={{ fontSize: 13 }}>{a.response}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
