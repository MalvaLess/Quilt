import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePlaySession } from "./usePlaySession";
import { api } from "../../api/client";
import { darkenHex, lightenHex } from "../../utils/color";
import { useLanguage } from "../../i18n/LanguageContext";
import WelcomeScreen from "../../components/WelcomeScreen";
import Logo from "../../components/Logo";
import QuestionCard from "../../components/QuestionCard";
import PlayerButton from "../../components/PlayerButton";
import RewardCard from "../../components/RewardCard";
import BuildRewardCard from "../../components/BuildRewardCard";
import EmojiPickerButton from "../../components/EmojiPickerButton";

const DEFAULT_NEEDED_POINTS = 60;

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

const inputStyle = {
  height: 44,
  padding: "0 10px",
  borderRadius: 9,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.14)",
  color: "#e9e9ed",
  fontSize: 13,
  fontFamily: "Inter,system-ui,sans-serif",
};

export default function PlayPage() {
  const { slug } = useParams();
  const { t } = useLanguage();
  const [screen, setScreen] = useState("welcome"); // welcome | play | rewards | schedule | confirmed
  const { token, current, loading, error, start, answer, skip, answerPhoto } = usePlaySession(slug);
  const [rewards, setRewards] = useState(null);
  const [selected, setSelected] = useState(null); // { kind: "option" | "custom", id }
  const [experienceInfo, setExperienceInfo] = useState(null);
  const [infoError, setInfoError] = useState(null);
  const [showBuildForm, setShowBuildForm] = useState(false);
  const [buildForm, setBuildForm] = useState({ label: "", description: "", icon: "🎁" });
  const [buildError, setBuildError] = useState(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [confirmedInfo, setConfirmedInfo] = useState(null);
  const [rewardsError, setRewardsError] = useState(null);
  const [showRewardError, setShowRewardError] = useState(false);
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    api
      .getExperienceInfo(slug)
      .then(setExperienceInfo)
      .catch((e) => setInfoError(e.message));
  }, [slug]);

  const handleNameSubmit = async (name) => {
    setPlayerName(name);
    await start(name);
    setScreen("play");
  };

  const handleAnswer = async (text) => {
    await answer(current.question_id, text);
  };

  const handleSkip = async () => {
    await skip(current.question_id);
  };

  const handlePhotoAnswer = async (file) => {
    await answerPhoto(current.question_id, file);
  };

  const fetchRewards = async () => {
    const data = await api.getRewards(token);
    setRewards(data);
  };

  const loadRewards = async () => {
    setRewardsError(null);
    try {
      await fetchRewards();
      setScreen("rewards");
    } catch (e) {
      setRewardsError(e.message);
    }
  };

  const getSelectedReward = () => {
    if (!selected || !rewards) return null;
    const list = selected.kind === "option" ? rewards.options : rewards.custom.created;
    return list.find((r) => r.id === selected.id) ?? null;
  };

  const finalizeReward = async (chosenDate, chosenTime) => {
    const res = await api.selectReward(
      token,
      {
        rewardOptionId: selected.kind === "option" ? selected.id : null,
        customRewardId: selected.kind === "custom" ? selected.id : null,
      },
      chosenDate,
      chosenTime,
    );
    setConfirmedInfo({ reward: res.reward, date: chosenDate, time: chosenTime });
    setScreen("confirmed");
  };

  const handleConfirmClick = () => {
    if (!selected) {
      setShowRewardError(true);
      return;
    }
    const meta = getSelectedReward();
    if (selected.kind === "option" && meta?.requires_datetime) {
      setScreen("schedule");
      return;
    }
    finalizeReward(null, null);
  };

  const handleConfirmSchedule = () => {
    if (!scheduleDate || !scheduleTime) return;
    finalizeReward(scheduleDate, scheduleTime);
  };

  const submitCustomReward = async () => {
    if (!buildForm.label.trim()) {
      setBuildError(t("playApp.customRewardNameError"));
      return;
    }
    try {
      await api.createCustomReward(token, buildForm);
      setBuildForm({ label: "", description: "", icon: "🎁" });
      setShowBuildForm(false);
      setBuildError(null);
      await fetchRewards();
    } catch (e) {
      setBuildError(e.message);
    }
  };

  const restart = () => {
    setScreen("welcome");
    setRewards(null);
    setSelected(null);
    setShowBuildForm(false);
    setBuildForm({ label: "", description: "", icon: "🎁" });
    setBuildError(null);
    setScheduleDate("");
    setScheduleTime("");
    setConfirmedInfo(null);
    setRewardsError(null);
    setShowRewardError(false);
  };

  const gem = experienceInfo?.theme_color || "#ff2d4f";
  const themeStyle = {
    "--color-gem": gem,
    "--color-gem-light": lightenHex(gem, 0.64),
    "--color-gem-dark": darkenHex(gem, 0.22),
  };

  if (infoError) return <p style={{ color: "#ff2d4f", padding: 32 }}>{t("playApp.errorPrefix")} {infoError}</p>;
  if (error) return <p style={{ color: "#ff2d4f", padding: 32 }}>{t("playApp.errorPrefix")} {error}</p>;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0d", color: "#e9e9ed", fontFamily: "Inter,system-ui,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", ...themeStyle }}>
      <Logo style={{ position: "fixed", top: 24, left: 28 }} />
      <div style={{ width: "100%", maxWidth: 440, background: "rgba(255,255,255,0.045)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, boxShadow: "0 24px 60px rgba(0,0,0,0.5)", padding: 32 }}>
        {screen === "welcome" && <WelcomeScreen experienceInfo={experienceInfo} onSubmit={handleNameSubmit} />}

        {loading && screen !== "welcome" && <p style={{ fontSize: 14, color: "rgba(233,233,237,0.6)" }}>{t("playApp.loading")}</p>}

        {screen === "play" && current && !loading && (
          <>
            {current.module_type === "question" && (
              <QuestionCard
                question={current}
                points={current.total_points ?? 0}
                neededPoints={current.reward_threshold ?? DEFAULT_NEEDED_POINTS}
                rewardsUnlocked={Boolean(current.rewards_unlocked)}
                onJumpToRewards={loadRewards}
                onSubmit={handleAnswer}
                onSkip={handleSkip}
                onSubmitPhoto={handlePhotoAnswer}
              />
            )}

            {current.module_type === "done" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: "center" }}>
                <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 18 }}>{t("playApp.finishedQuestions")}</div>
                {current.rewards_unlocked ? (
                  <>
                    <p style={{ fontSize: 13, color: "rgba(233,233,237,0.65)", margin: 0 }}>
                      {t("playApp.readyToChoose").replace("{points}", current.total_points ?? 0)}
                    </p>
                    <PlayerButton label={t("playApp.viewMyRewards")} onClick={loadRewards} />
                    {rewardsError && <p style={{ color: "#ff2d4f", fontSize: 13 }}>{rewardsError}</p>}
                  </>
                ) : (
                  <p style={{ fontSize: 13, color: "rgba(233,233,237,0.65)", margin: 0 }}>
                    {t("playApp.notEnoughPoints")}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {screen === "rewards" && rewards && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(233,233,237,0.5)" }}>
              {t("playApp.youHave")} {current?.total_points ?? 0} {t("playApp.points")}
            </div>
            <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 20 }}>{t("playApp.chooseReward")}</div>

            {rewards.options.length === 0 &&
              rewards.custom.created.length === 0 &&
              !(rewards.custom.enabled && rewards.custom.remaining > 0) && (
                <p style={{ fontSize: 13, color: "rgba(233,233,237,0.6)" }}>
                  {t("playApp.noRewardsYet")}
                </p>
              )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {rewards.options.map((r) => (
                <RewardCard
                  key={`option-${r.id}`}
                  reward={r}
                  isSelected={!showBuildForm && selected?.kind === "option" && selected?.id === r.id}
                  onSelect={() => {
                    setSelected({ kind: "option", id: r.id });
                    setShowBuildForm(false);
                    setShowRewardError(false);
                  }}
                />
              ))}
              {rewards.custom.created.map((r) => (
                <RewardCard
                  key={`custom-${r.id}`}
                  reward={r}
                  isSelected={!showBuildForm && selected?.kind === "custom" && selected?.id === r.id}
                  onSelect={() => {
                    setSelected({ kind: "custom", id: r.id });
                    setShowBuildForm(false);
                    setShowRewardError(false);
                  }}
                />
              ))}
              {rewards.custom.enabled && rewards.custom.remaining > 0 && (
                <BuildRewardCard
                  active={showBuildForm}
                  onOpen={() => {
                    setSelected(null);
                    setShowBuildForm(true);
                    setShowRewardError(false);
                  }}
                />
              )}
            </div>

            {showBuildForm && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <EmojiPickerButton value={buildForm.icon} onChange={(v) => setBuildForm({ ...buildForm, icon: v })} />
                  <input
                    type="text"
                    value={buildForm.label}
                    onChange={(e) => setBuildForm({ ...buildForm, label: e.target.value })}
                    placeholder={t("playApp.customRewardPlaceholder")}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
                <textarea
                  value={buildForm.description}
                  onChange={(e) => setBuildForm({ ...buildForm, description: e.target.value })}
                  placeholder={t("playApp.customRewardDescPlaceholder")}
                  style={{ ...inputStyle, height: 64, resize: "none", padding: "10px 12px" }}
                />
              </div>
            )}

            {showRewardError && <div style={{ fontSize: 12, color: "#ff2d4f" }}>{t("playApp.selectRewardError")}</div>}

            <div>
              <PlayerButton label={t("playApp.continue")} onClick={showBuildForm ? submitCustomReward : handleConfirmClick} />
            </div>
            {buildError && <p style={{ color: "#ff2d4f", fontSize: 12 }}>{buildError}</p>}
            {rewardsError && <p style={{ color: "#ff2d4f", fontSize: 13 }}>{rewardsError}</p>}
          </div>
        )}

        {screen === "schedule" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 20 }}>{t("playApp.whenTitle")}</div>
            <p style={{ fontSize: 13, color: "rgba(233,233,237,0.65)", margin: 0 }}>{t("playApp.whenSubtitle")}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select
                value={scheduleTime.split(":")[0] || ""}
                onChange={(e) => setScheduleTime(`${e.target.value}:${scheduleTime.split(":")[1] || "00"}`)}
                style={{ ...inputStyle, flex: 1 }}
              >
                <option value="" disabled>{t("playApp.hourPlaceholder")}</option>
                {HOUR_OPTIONS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <span style={{ color: "rgba(233,233,237,0.5)" }}>:</span>
              <select
                value={scheduleTime.split(":")[1] || ""}
                onChange={(e) => setScheduleTime(`${scheduleTime.split(":")[0] || "00"}:${e.target.value}`)}
                style={{ ...inputStyle, flex: 1 }}
              >
                <option value="" disabled>{t("playApp.minutePlaceholder")}</option>
                {MINUTE_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <PlayerButton label={t("playApp.confirm")} onClick={handleConfirmSchedule} disabled={!scheduleDate || !scheduleTime} />
            </div>
          </div>
        )}

        {screen === "confirmed" && confirmedInfo && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14 }}>
            <i className="fa-solid fa-circle-check" style={{ fontSize: 40, color: "var(--color-gem)" }} />
            <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 20 }}>{t("playApp.thanks").replace("{name}", playerName)}</div>
            <p style={{ fontSize: 13, color: "rgba(233,233,237,0.65)", margin: 0, maxWidth: "28ch" }}>
              {t("playApp.giftSentMsg")}
            </p>
            <div style={{ fontSize: 12, background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "10px 16px" }}>
              {confirmedInfo.reward}
              {confirmedInfo.date && confirmedInfo.time ? ` · ${confirmedInfo.date} ${confirmedInfo.time}` : ""} · {current?.total_points ?? 0} {t("playApp.points")}
            </div>
            <div style={{ width: "100%", marginTop: 6 }}>
              <PlayerButton label={t("playApp.playAgain")} onClick={restart} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
