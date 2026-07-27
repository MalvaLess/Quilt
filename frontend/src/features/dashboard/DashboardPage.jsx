import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, resolveImageUrl } from "../../api/client";
import ColorPickerButton from "../../components/ColorPickerButton";
import Logo from "../../components/Logo";
import SiteBackground from "../../components/SiteBackground";

const TABS = [
  { key: "general", label: "General" },
  { key: "modulos", label: "Módulos" },
  { key: "recompensas", label: "Recompensas" },
  { key: "compartir", label: "Compartir" },
  { key: "respuestas", label: "Respuestas" },
];

const STATUS_STYLES = {
  published: { label: "Activa", bg: "rgba(255,45,79,0.18)", color: "#ffb3c0" },
  draft: { label: "Borrador", bg: "rgba(255,255,255,0.08)", color: "rgba(233,233,237,0.65)" },
};

const AVATAR_PALETTE = [
  { bg: "rgba(255,45,79,0.18)", color: "#ffb3c0" },
  { bg: "rgba(79,157,255,0.18)", color: "#a8d8ff" },
  { bg: "rgba(232,177,58,0.18)", color: "#ffe0a3" },
];

const fieldLabel = { fontSize: 12, color: "rgba(233,233,237,0.6)", display: "block", marginBottom: 6 };
const fieldInput = { width: "100%", height: 42, padding: "0 12px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.14)", color: "#e9e9ed", fontSize: 14, fontFamily: "Inter,system-ui,sans-serif" };
const rowInput = { flex: 1, background: "transparent", border: "none", color: "#e9e9ed", fontSize: 14, fontFamily: "Inter,system-ui,sans-serif", outline: "none" };
const pointsInput = { width: 64, height: 32, textAlign: "center", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "#e9e9ed", fontSize: 12 };
const rowShell = { display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" };
const addPill = { fontSize: 12, padding: "8px 14px", borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.16)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 };
const typeIcon = { color: "#ff2d4f", fontSize: 15, width: 18, textAlign: "center" };

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

function defaultPromptFor(type) {
  if (type === "multiple_choice") return "Nueva pregunta de opción múltiple";
  if (type === "photo") return "Nueva pregunta de foto";
  return "Nueva pregunta de texto libre";
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [creator, setCreator] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [stats, setStats] = useState({});
  const [view, setView] = useState("list");
  const [selectedExp, setSelectedExp] = useState(null);
  const [fullExperience, setFullExperience] = useState(null);
  const [editorTab, setEditorTab] = useState("general");
  const [linkRevealed, setLinkRevealed] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copiar");
  const [players, setPlayers] = useState(null);
  const [expandedPlayer, setExpandedPlayer] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [moduleError, setModuleError] = useState(null);

  const fullExpRef = useRef(null);
  const saveTimers = useRef({});
  useEffect(() => {
    fullExpRef.current = fullExperience;
  }, [fullExperience]);

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
      const slug = `nueva-experiencia-${Date.now().toString(36)}`;
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
    if (!confirm(`¿Borrar "${exp.title}"? Esto elimina también sus módulos y jugadores.`)) return;
    try {
      await api.deleteExperience(exp.id);
      setExperiences((prev) => prev.filter((e) => e.id !== exp.id));
      if (selectedExp?.id === exp.id) {
        setSelectedExp(null);
        setFullExperience(null);
        setView("list");
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("quilt_token");
    navigate("/login", { replace: true });
  };

  // ---- experience field auto-save (General tab) ----
  const patchExperienceField = (field, value, immediate = false) => {
    setFullExperience((prev) => (prev ? { ...prev, [field]: value } : prev));
    setSelectedExp((prev) => (prev ? { ...prev, [field]: value } : prev));
    const id = selectedExp.id;
    const run = () =>
      api
        .updateExperience(id, { [field]: value })
        .then((updated) => {
          setExperiences((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
        })
        .catch((e) => setLoadError(e.message));
    clearTimeout(saveTimers.current[field]);
    if (immediate) run();
    else saveTimers.current[field] = setTimeout(run, 500);
  };

  // ---- module save (Módulos / Recompensas tabs) ----
  const scheduleModuleSave = (moduleId) => {
    clearTimeout(saveTimers.current[`mod-${moduleId}`]);
    saveTimers.current[`mod-${moduleId}`] = setTimeout(() => {
      const mod = fullExpRef.current?.modules.find((m) => m.id === moduleId);
      if (!mod) return;
      const payload =
        mod.type === "question"
          ? {
              questions: mod.questions.map((q) => ({
                prompt: q.prompt,
                points: q.points,
                repeatable: q.repeatable,
                input_type: q.input_type,
                options: q.input_type === "multiple_choice" ? q.options ?? [] : null,
                image_id: q.image_id ?? null,
              })),
            }
          : {
              reward_options: mod.reward_options.map((r) => ({
                label: r.label,
                description: r.description,
                icon: r.icon,
                unlock_points: r.unlock_points,
                requires_datetime: r.requires_datetime,
              })),
            };
      api.updateModule(moduleId, payload).catch((e) => setModuleError(e.message));
    }, 500);
  };

  const updateQuestionField = (moduleId, qIndex, field, value) => {
    setModuleError(null);
    setFullExperience((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id !== moduleId ? m : { ...m, questions: m.questions.map((q, i) => (i !== qIndex ? q : { ...q, [field]: value })) },
      ),
    }));
    scheduleModuleSave(moduleId);
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
    clearTimeout(saveTimers.current[`mod-${moduleId}`]);
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
    const question = {
      prompt: defaultPromptFor(type),
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

  const updateRewardField = (moduleId, rIndex, field, value, immediate = false) => {
    setFullExperience((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id !== moduleId ? m : { ...m, reward_options: m.reward_options.map((r, i) => (i !== rIndex ? r : { ...r, [field]: value })) },
      ),
    }));
    if (immediate) {
      clearTimeout(saveTimers.current[`mod-${moduleId}`]);
      const mod = { ...fullExpRef.current.modules.find((m) => m.id === moduleId) };
      const rewardOptions = mod.reward_options.map((r, i) => (i !== rIndex ? r : { ...r, [field]: value }));
      api
        .updateModule(moduleId, {
          reward_options: rewardOptions.map((r) => ({
            label: r.label,
            description: r.description,
            icon: r.icon,
            unlock_points: r.unlock_points,
            requires_datetime: r.requires_datetime,
          })),
        })
        .catch((e) => setModuleError(e.message));
    } else {
      scheduleModuleSave(moduleId);
    }
  };

  const addReward = async () => {
    setModuleError(null);
    const reward = { label: "Nueva recompensa", description: "", icon: "🎁", unlock_points: 10, requires_datetime: false };
    try {
      if (rewardModule) {
        const rewardOptions = [...rewardModule.reward_options, reward];
        await api.updateModule(rewardModule.id, {
          reward_options: rewardOptions.map((r) => ({
            label: r.label,
            description: r.description,
            icon: r.icon,
            unlock_points: r.unlock_points,
            requires_datetime: r.requires_datetime,
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
    const mod = fullExperience.modules.find((m) => m.id === moduleId);
    const remaining = mod.reward_options.filter((_, i) => i !== rIndex);
    setFullExperience((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => (m.id !== moduleId ? m : { ...m, reward_options: remaining })),
    }));
    clearTimeout(saveTimers.current[`mod-${moduleId}`]);
    try {
      await api.updateModule(moduleId, {
        reward_options: remaining.map((r) => ({
          label: r.label,
          description: r.description,
          icon: r.icon,
          unlock_points: r.unlock_points,
          requires_datetime: r.requires_datetime,
        })),
      });
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
    api.updateModule(rewardModule.id, { custom_reward_limit: newLimit }).catch((e) => setModuleError(e.message));
  };

  const handleDeletePhoto = async (playerId, answerId, imageId) => {
    if (!confirm("¿Borrar esta foto? No se puede deshacer.")) return;
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

  const link = selectedExp ? `${window.location.origin}/play/${selectedExp.slug}` : "";
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopyLabel("¡Copiado!");
      setTimeout(() => setCopyLabel("Copiar"), 1500);
    } catch {
      // clipboard no disponible
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#e9e9ed", fontFamily: "Inter,system-ui,sans-serif", position: "relative" }}>
      <SiteBackground />
      {/* TOPBAR */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 12, padding: "14px 28px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(23,18,20,0.55)", backdropFilter: "blur(12px)" }}>
        <Logo style={{ marginRight: "auto" }} />
        <div style={{ fontSize: 13, color: "rgba(233,233,237,0.7)" }}>{creator?.display_name || creator?.email}</div>
        <div onClick={handleLogout} style={{ fontSize: 13, color: "rgba(233,233,237,0.55)", cursor: "pointer" }}>
          Cerrar sesión
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "36px 24px" }}>
        {loadError && <p style={{ color: "#ff2d4f", fontSize: 13, marginBottom: 16 }}>No se pudieron cargar tus experiencias: {loadError}</p>}

        {/* LIST VIEW */}
        {view === "list" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 24 }}>Tus experiencias</div>
              <div
                onClick={createExperience}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 13, color: "#ffb3c0", background: "rgba(255,45,79,0.16)", border: "1.5px solid #ff2d4f", borderRadius: 9, padding: "10px 18px", cursor: "pointer" }}
              >
                + Nueva experiencia
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
              {experiences.map((exp) => {
                const st = STATUS_STYLES[exp.status] ?? STATUS_STYLES.draft;
                const s = stats[exp.id];
                return (
                  <div key={exp.id} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div onClick={() => selectExperience(exp)} style={{ cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 16 }}>{exp.title}</div>
                        <div style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, background: st.bg, color: st.color }}>{st.label}</div>
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(233,233,237,0.55)", marginTop: 10 }}>
                        {s ? `${s.plays} jugadas · ${s.moduleCount} módulos` : "cargando…"}
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
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div onClick={() => setView("list")} style={{ fontSize: 13, color: "rgba(233,233,237,0.6)", cursor: "pointer" }}>
                <i className="fa-solid fa-arrow-left" /> Experiencias
              </div>
            </div>
            <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 24, marginBottom: 18 }}>{selectedExp.title}</div>

            <div style={{ display: "flex", gap: 4, borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 24 }}>
              {TABS.map((t) => (
                <div
                  key={t.key}
                  onClick={() => openTab(t.key)}
                  style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: editorTab === t.key ? "#ffb3c0" : "rgba(233,233,237,0.55)", borderBottom: `2px solid ${editorTab === t.key ? "#ff2d4f" : "transparent"}` }}
                >
                  {t.label}
                </div>
              ))}
            </div>

            {fullExperience && editorTab === "general" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 440 }}>
                <div>
                  <label style={fieldLabel}>Nombre</label>
                  <input
                    type="text"
                    value={fullExperience.title}
                    onChange={(e) => patchExperienceField("title", e.target.value)}
                    style={fieldInput}
                  />
                </div>

                <div style={{ position: "relative" }}>
                  <label style={fieldLabel}>Color de la experiencia</label>
                  <ColorPickerButton value={fullExperience.theme_color || "#ff2d4f"} onChange={(c) => patchExperienceField("theme_color", c, true)} />
                </div>

                <div>
                  <label style={fieldLabel}>Descripción</label>
                  <textarea
                    value={fullExperience.description || ""}
                    onChange={(e) => patchExperienceField("description", e.target.value)}
                    placeholder="¿De qué trata esta experiencia?"
                    style={{ width: "100%", height: 70, resize: "none", padding: "10px 12px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.14)", color: "#e9e9ed", fontSize: 14, fontFamily: "Inter,system-ui,sans-serif" }}
                  />
                </div>

                <div>
                  <label style={fieldLabel}>Código de la experiencia</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10, padding: "10px 12px" }}>
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
                  <label style={fieldLabel}>Puntos por defecto para desbloquear recompensas</label>
                  <input
                    type="number"
                    value={fullExperience.reward_threshold}
                    onChange={(e) => patchExperienceField("reward_threshold", parseInt(e.target.value) || 0)}
                    style={{ width: 120, height: 42, padding: "0 12px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.14)", color: "#e9e9ed", fontSize: 14, fontFamily: "Inter,system-ui,sans-serif" }}
                  />
                  <div style={{ fontSize: 11, color: "rgba(233,233,237,0.5)", marginTop: 6 }}>
                    Se usa cuando una recompensa no tiene un puntaje propio asignado.
                  </div>
                </div>

                <div
                  onClick={() => patchExperienceField("status", fullExperience.status === "published" ? "draft" : "published", true)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", cursor: "pointer" }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Experiencia activa</div>
                    <div style={{ fontSize: 12, color: "rgba(233,233,237,0.55)", marginTop: 2 }}>Publicala para que se pueda jugar.</div>
                  </div>
                  <div style={{ width: 38, height: 22, borderRadius: 11, background: fullExperience.status === "published" ? "#ff2d4f" : "rgba(255,255,255,0.15)", position: "relative", flex: "none" }}>
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
                            style={rowInput}
                          />
                          <input
                            type="number"
                            value={q.points}
                            onChange={(e) => updateQuestionField(m.id, qIndex, "points", parseInt(e.target.value) || 0)}
                            style={pointsInput}
                          />
                          <div style={{ fontSize: 11, color: "rgba(233,233,237,0.5)" }}>pts</div>
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
                            repetible
                          </label>
                          {q.image_url ? (
                            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <img src={resolveImageUrl(q.image_url)} alt="" style={{ width: 22, height: 22, objectFit: "cover", borderRadius: 4, border: "1px solid rgba(255,255,255,0.2)" }} />
                              <span onClick={() => handleImageRemove(m.id, qIndex)} style={{ color: "#ff2d4f", cursor: "pointer", textDecoration: "underline" }}>
                                quitar imagen
                              </span>
                            </span>
                          ) : (
                            <label style={{ cursor: "pointer" }}>
                              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImageSelect(m.id, qIndex, e.target.files?.[0])} />
                              <span style={{ color: "#ffb3c0", textDecoration: "underline" }}>+ imagen</span>
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
                                  placeholder={`Opción ${oIndex + 1}`}
                                  style={{ flex: 1, height: 30, padding: "0 10px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "#e9e9ed", fontSize: 12 }}
                                />
                                {q.options.length > 2 && (
                                  <span onClick={() => removeOption(m.id, qIndex, oIndex)} style={{ fontSize: 11, color: "#ff2d4f", cursor: "pointer" }}>
                                    quitar
                                  </span>
                                )}
                              </div>
                            ))}
                            <span onClick={() => addOption(m.id, qIndex)} style={{ fontSize: 11, color: "#ffb3c0", textDecoration: "underline", cursor: "pointer" }}>
                              + agregar opción
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <div onClick={() => addQuestion("multiple_choice")} style={addPill}>
                    <i className="fa-solid fa-list-check" /> Opción múltiple
                  </div>
                  <div onClick={() => addQuestion("text")} style={addPill}>
                    <i className="fa-solid fa-align-left" /> Texto libre
                  </div>
                  <div onClick={() => addQuestion("photo")} style={addPill}>
                    <i className="fa-solid fa-camera" /> Foto
                  </div>
                </div>
              </>
            )}

            {fullExperience && editorTab === "recompensas" && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                  {moduleError && <p style={{ color: "#ff2d4f", fontSize: 13 }}>{moduleError}</p>}
                  {(rewardModule?.reward_options ?? []).map((r, rIndex) => (
                    <div key={rIndex} style={rowShell}>
                      <GripIcon />
                      <input
                        value={r.icon || ""}
                        onChange={(e) => updateRewardField(rewardModule.id, rIndex, "icon", e.target.value)}
                        style={{ ...rowInput, flex: "none", width: 28, fontSize: 20, textAlign: "center" }}
                      />
                      <input
                        value={r.label}
                        onChange={(e) => updateRewardField(rewardModule.id, rIndex, "label", e.target.value)}
                        style={rowInput}
                      />
                      <div style={{ fontSize: 11, color: "rgba(233,233,237,0.5)" }}>desde</div>
                      <input
                        type="number"
                        value={r.unlock_points ?? ""}
                        onChange={(e) => updateRewardField(rewardModule.id, rIndex, "unlock_points", e.target.value === "" ? null : parseInt(e.target.value))}
                        style={pointsInput}
                      />
                      <div style={{ fontSize: 11, color: "rgba(233,233,237,0.5)" }}>pts</div>
                      <div
                        onClick={() => updateRewardField(rewardModule.id, rIndex, "requires_datetime", !r.requires_datetime, true)}
                        style={{ fontSize: 11, padding: "6px 10px", borderRadius: 6, cursor: "pointer", background: r.requires_datetime ? "rgba(255,45,79,0.18)" : "rgba(255,255,255,0.06)", color: r.requires_datetime ? "#ffb3c0" : "rgba(233,233,237,0.5)", whiteSpace: "nowrap" }}
                      >
                        <i className="fa-solid fa-calendar" /> Fecha y hora
                      </div>
                      <i
                        onClick={() => deleteReward(rewardModule.id, rIndex)}
                        className="fa-solid fa-trash"
                        style={{ color: "rgba(233,233,237,0.4)", fontSize: 13, cursor: "pointer" }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  <div onClick={addReward} style={addPill}>
                    + Agregar recompensa
                  </div>
                </div>
                <div
                  onClick={toggleCustomReward}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 10, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", cursor: rewardModule ? "pointer" : "not-allowed", opacity: rewardModule ? 1 : 0.5 }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Permitir recompensa personalizada</div>
                    <div style={{ fontSize: 12, color: "rgba(233,233,237,0.55)", marginTop: 2 }}>El jugador puede proponer la suya, ej. un picnic.</div>
                  </div>
                  <div style={{ width: 38, height: 22, borderRadius: 11, background: rewardModule?.custom_reward_limit != null ? "#ff2d4f" : "rgba(255,255,255,0.15)", position: "relative", flex: "none" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: rewardModule?.custom_reward_limit != null ? 19 : 3, transition: "left 0.2s ease" }} />
                  </div>
                </div>
              </>
            )}

            {fullExperience && editorTab === "compartir" && (
              <div style={{ maxWidth: 440 }}>
                <div style={{ fontSize: 13, color: "rgba(233,233,237,0.6)", marginBottom: 8 }}>Link de la experiencia</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ flex: 1, fontSize: 13, fontFamily: "monospace", letterSpacing: "0.02em", color: "#e9e9ed", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {linkRevealed ? link : "••••••••••••••••••"}
                  </div>
                  <i
                    onClick={() => setLinkRevealed(!linkRevealed)}
                    className={`fa-solid ${linkRevealed ? "fa-eye-slash" : "fa-eye"}`}
                    style={{ cursor: "pointer", color: "rgba(233,233,237,0.6)" }}
                  />
                  <div onClick={copyLink} style={{ fontSize: 12, fontWeight: 600, color: "#ffb3c0", cursor: "pointer", whiteSpace: "nowrap" }}>
                    {copyLabel}
                  </div>
                </div>
              </div>
            )}

            {editorTab === "respuestas" && (
              <>
                {players === null && <p style={{ color: "rgba(233,233,237,0.5)", fontSize: 13 }}>Cargando...</p>}
                {players?.length === 0 && (
                  <p style={{ color: "rgba(233,233,237,0.5)", fontSize: 13, padding: "20px 0" }}>Todavía no hay respuestas para esta experiencia.</p>
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
                        <div style={{ display: "flex", gap: 14, fontSize: 12 }}>
                          <div style={{ color: "rgba(233,233,237,0.6)" }}>{p.total_points} pts</div>
                          <div style={{ color: "#ffb3c0" }}>Recompensa: {p.reward_chosen || "sin recompensa"}</div>
                        </div>
                        {p.answers.map((a, ai) => (
                          <div key={ai} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 12px" }}>
                            <div style={{ fontSize: 11, color: "rgba(233,233,237,0.5)", marginBottom: 3 }}>{a.prompt}</div>
                            {a.skipped ? (
                              <div style={{ color: "rgba(233,233,237,0.5)", fontStyle: "italic", fontSize: 13 }}>(saltada)</div>
                            ) : a.response_image_url ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                                <img src={resolveImageUrl(a.response_image_url)} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)" }} />
                                <span
                                  onClick={() => handleDeletePhoto(p.id, a.id, a.response_image_id)}
                                  style={{ fontSize: 11, color: "#ff2d4f", textDecoration: "underline", cursor: "pointer" }}
                                >
                                  borrar foto
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
