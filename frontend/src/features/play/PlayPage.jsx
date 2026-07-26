import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePlaySession } from "./usePlaySession";
import { api } from "../../api/client";
import { darkenHex } from "../../utils/color";
import NameGate from "../../components/NameGate";
import CoverScreen from "../../components/CoverScreen";
import QuestionCard from "../../components/QuestionCard";
import PatchCard from "../../components/PatchCard";
import ProgressDots from "../../components/ProgressDots";
import RewardCard from "../../components/RewardCard";
import BuildRewardCard from "../../components/BuildRewardCard";

const POINTS_PER_QUESTION = 15;
const DEFAULT_NEEDED_POINTS = 60;

export default function PlayPage() {
  const { slug } = useParams();
  const [screen, setScreen] = useState("name"); // name | cover | play | rewards
  const { token, current, loading, error, start, answer, skip, answerPhoto } = usePlaySession(slug);
  const [patches, setPatches] = useState([]);
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

  useEffect(() => {
    api
      .getExperienceInfo(slug)
      .then(setExperienceInfo)
      .catch((e) => setInfoError(e.message));
  }, [slug]);

  const handleNameSubmit = async (name) => {
    await start(name);
    setScreen("cover");
  };

  if (infoError) return <p className="text-gem p-8">Error: {infoError}</p>;
  if (error) return <p className="text-gem p-8">Error: {error}</p>;

  const handleAnswer = async (text) => {
    setPatches((prev) => [
      ...prev,
      { tag: "respuesta", response: text, rotation: Math.random() * 8 - 4 },
    ]);
    await answer(current.question_id, text);
  };

  const handleSkip = async () => {
    await skip(current.question_id);
  };

  const handlePhotoAnswer = async (file) => {
    await answerPhoto(current.question_id, file);
    setPatches((prev) => [
      ...prev,
      { tag: "foto", response: "📷", rotation: Math.random() * 8 - 4 },
    ]);
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
    const meta = getSelectedReward();
    if (selected?.kind === "option" && meta?.requires_datetime) {
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
      setBuildError("Ponele un nombre a tu recompensa");
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

  const themeColor = experienceInfo?.theme_color;
  const themeStyle = themeColor
    ? { "--color-gem": themeColor, "--color-gem-dark": darkenHex(themeColor, 0.22) }
    : undefined;

  return (
    <div
      className="min-h-screen text-parchment p-6 flex justify-center items-center font-sans"
      style={themeStyle}
    >
      <div className="w-full max-w-md">
        {screen === "name" && <NameGate onSubmit={handleNameSubmit} />}

        {loading && screen !== "name" && <p>Cargando...</p>}

        {screen === "cover" && !loading && (
          <CoverScreen onStart={() => setScreen("play")} />
        )}

        {screen === "play" && current && (
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-mustard text-sm font-bold">
                ★ {current.total_points ?? 0} pts
              </span>
              <ProgressDots
                totalPoints={current.total_points ?? 0}
                pointsPerQuestion={POINTS_PER_QUESTION}
                neededPoints={current.reward_threshold ?? DEFAULT_NEEDED_POINTS}
              />
            </div>

            <div className="bg-plum rounded-2xl p-3.5 min-h-[92px] flex flex-wrap gap-2 mb-4">
              {patches.map((p, i) => (
                <PatchCard key={i} {...p} />
              ))}
            </div>

            {current.module_type === "question" && (
              <QuestionCard
                question={current}
                onSubmit={handleAnswer}
                onSkip={handleSkip}
                onSubmitPhoto={handlePhotoAnswer}
              />
            )}

            {current.module_type === "done" && (
              <div className="text-center screen-enter mb-4">
                <p>¡Terminaste las preguntas!</p>
              </div>
            )}

            {current.rewards_unlocked && (
              <div className="text-center screen-enter mt-4">
                <button
                  onClick={loadRewards}
                  className="btn-fill bg-gem px-6 py-3 rounded-xl font-semibold"
                >
                  Elegir mi cita »
                </button>
                {rewardsError && (
                  <p className="text-gem text-sm mt-3">{rewardsError}</p>
                )}
              </div>
            )}
          </>
        )}

        {screen === "rewards" && rewards && (
          <div className="screen-enter">
            {rewards.options.length === 0 &&
              rewards.custom.created.length === 0 &&
              !(rewards.custom.enabled && rewards.custom.remaining > 0) && (
                <p className="text-parchment-dim text-sm mb-4">
                  Todavía no hay recompensas cargadas para esta experiencia.
                </p>
              )}
            <div className="grid grid-cols-2 gap-2.5">
              {rewards.options.map((r) => (
                <RewardCard
                  key={`option-${r.id}`}
                  reward={r}
                  isSelected={selected?.kind === "option" && selected?.id === r.id}
                  onSelect={() => setSelected({ kind: "option", id: r.id })}
                />
              ))}
              {rewards.custom.created.map((r) => (
                <RewardCard
                  key={`custom-${r.id}`}
                  reward={r}
                  isSelected={selected?.kind === "custom" && selected?.id === r.id}
                  onSelect={() => setSelected({ kind: "custom", id: r.id })}
                />
              ))}
              {rewards.custom.enabled && rewards.custom.remaining > 0 && (
                <BuildRewardCard
                  remaining={rewards.custom.remaining}
                  onOpen={() => setShowBuildForm(true)}
                />
              )}
            </div>

            <button
              onClick={handleConfirmClick}
              disabled={!selected}
              className="btn-fill w-full mt-4 bg-gem px-6 py-3 rounded-xl font-semibold disabled:opacity-40 disabled:pointer-events-none"
            >
              Confirmar recompensa »
            </button>

            {showBuildForm && (
              <div className="mt-4 bg-void-2 border border-white/15 rounded-2xl p-4">
                <h3 className="font-display text-sm mb-3">Armá tu recompensa</h3>
                {buildError && <p className="text-gem text-xs mb-2">{buildError}</p>}
                <div className="flex gap-2 mb-2">
                  <input
                    value={buildForm.icon}
                    onChange={(e) => setBuildForm({ ...buildForm, icon: e.target.value })}
                    placeholder="🎁"
                    className="w-14 rounded-lg border border-white/20 bg-void p-2 text-sm text-center"
                  />
                  <input
                    value={buildForm.label}
                    onChange={(e) => setBuildForm({ ...buildForm, label: e.target.value })}
                    placeholder="Nombre de tu recompensa"
                    className="flex-1 rounded-lg border border-white/20 bg-void p-2 text-sm"
                  />
                </div>
                <textarea
                  value={buildForm.description}
                  onChange={(e) => setBuildForm({ ...buildForm, description: e.target.value })}
                  placeholder="Describila un poco (opcional)"
                  rows={2}
                  className="w-full rounded-lg border border-white/20 bg-void p-2 text-sm resize-none mb-3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={submitCustomReward}
                    className="btn-fill bg-gem px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Crear
                  </button>
                  <button
                    onClick={() => setShowBuildForm(false)}
                    className="btn-text text-parchment-dim text-xs underline"
                  >
                    cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {screen === "schedule" && (
          <div className="screen-enter bg-void-2 border border-white/10 rounded-2xl p-6">
            <h2 className="font-display text-xl mb-1">Elegí fecha y hora</h2>
            <p className="text-parchment-dim text-sm mb-4">
              Para "{getSelectedReward()?.label}"
            </p>
            <label className="block text-xs text-parchment-dim mb-1">Fecha</label>
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-void p-3 text-sm mb-3"
            />
            <label className="block text-xs text-parchment-dim mb-1">Hora</label>
            <input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-void p-3 text-sm mb-5"
            />
            <div className="flex gap-2">
              <button
                onClick={handleConfirmSchedule}
                disabled={!scheduleDate || !scheduleTime}
                className="btn-fill flex-1 bg-gem px-5 py-3 rounded-xl font-semibold text-sm disabled:opacity-40 disabled:pointer-events-none"
              >
                Confirmar »
              </button>
              <button
                onClick={() => setScreen("rewards")}
                className="btn-text text-parchment-dim text-sm"
              >
                volver
              </button>
            </div>
          </div>
        )}

        {screen === "confirmed" && confirmedInfo && (
          <div className="screen-enter bg-void-2 border border-white/10 rounded-2xl p-8 text-center">
            <span className="text-4xl block mb-3">🎉</span>
            <h2 className="font-display text-xl mb-2">¡Confirmado!</h2>
            <p className="text-parchment-dim text-sm">
              Elegiste <span className="text-parchment font-semibold">{confirmedInfo.reward}</span>
              {confirmedInfo.date && confirmedInfo.time && (
                <>
                  {" "}para el <span className="text-mustard">{confirmedInfo.date}</span> a las{" "}
                  <span className="text-mustard">{confirmedInfo.time}</span>
                </>
              )}
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
