import { useState } from "react";
import { api, resolveImageUrl } from "../../api/client";

const EMPTY_QUESTION = {
  prompt: "",
  points: 15,
  repeatable: false,
  input_type: "text",
  options: ["", ""],
  image_id: null,
  image_preview: null,
  uploading: false,
};
const EMPTY_REWARD = {
  label: "",
  description: "",
  icon: "",
  unlock_points: "",
  requires_datetime: false,
};

function initialQuestions(editingModule) {
  if (!editingModule?.questions?.length) {
    return [{ ...EMPTY_QUESTION, options: [...EMPTY_QUESTION.options] }];
  }
  return editingModule.questions.map((q) => ({
    prompt: q.prompt,
    points: q.points,
    repeatable: q.repeatable,
    input_type: q.input_type || "text",
    options: q.options?.length ? [...q.options] : ["", ""],
    image_id: q.image_id ?? null,
    image_preview: q.image_url ?? null,
    uploading: false,
  }));
}

function initialRewards(editingModule) {
  if (!editingModule?.reward_options?.length) {
    return [{ ...EMPTY_REWARD }];
  }
  return editingModule.reward_options.map((r) => ({
    label: r.label,
    description: r.description || "",
    icon: r.icon || "",
    unlock_points: r.unlock_points == null ? "" : String(r.unlock_points),
    requires_datetime: Boolean(r.requires_datetime),
  }));
}

export default function ModuleBuilder({ experience, onModuleAdded, editingModule, onCancelEdit }) {
  const isEditing = Boolean(editingModule);
  const [moduleType, setModuleType] = useState(editingModule?.type ?? "question");
  const [questions, setQuestions] = useState(() => initialQuestions(editingModule));
  const [rewards, setRewards] = useState(() => initialRewards(editingModule));
  const [customRewardLimit, setCustomRewardLimit] = useState(
    editingModule?.custom_reward_limit != null ? String(editingModule.custom_reward_limit) : "",
  );
  const [error, setError] = useState(null);

  const addQuestionRow = () =>
    setQuestions([...questions, { ...EMPTY_QUESTION, options: [...EMPTY_QUESTION.options] }]);
  const addRewardRow = () => setRewards([...rewards, { ...EMPTY_REWARD }]);

  const updateQuestion = (i, field, value) => {
    const copy = [...questions];
    copy[i][field] = value;
    setQuestions(copy);
  };

  const updateReward = (i, field, value) => {
    const copy = [...rewards];
    copy[i][field] = value;
    setRewards(copy);
  };

  const addOptionRow = (i) => {
    const copy = [...questions];
    copy[i].options = [...copy[i].options, ""];
    setQuestions(copy);
  };

  const updateOption = (i, oi, value) => {
    const copy = [...questions];
    const options = [...copy[i].options];
    options[oi] = value;
    copy[i].options = options;
    setQuestions(copy);
  };

  const removeOption = (i, oi) => {
    const copy = [...questions];
    copy[i].options = copy[i].options.filter((_, idx) => idx !== oi);
    setQuestions(copy);
  };

  const handleImageSelect = async (i, file) => {
    if (!file) return;
    setError(null);
    updateQuestion(i, "uploading", true);
    try {
      const { id, url } = await api.uploadImage(file);
      updateQuestion(i, "image_id", id);
      updateQuestion(i, "image_preview", url);
    } catch (e) {
      setError(e.message);
    } finally {
      updateQuestion(i, "uploading", false);
    }
  };

  const handleImageRemove = async (i) => {
    const q = questions[i];
    if (!q.image_id) return;
    try {
      await api.deleteImage(q.image_id);
    } catch (e) {
      setError(e.message);
    } finally {
      updateQuestion(i, "image_id", null);
      updateQuestion(i, "image_preview", null);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      const usableQuestions = questions.filter((q) => q.prompt.trim());
      for (const q of usableQuestions) {
        if (q.input_type === "multiple_choice") {
          const filled = q.options.map((o) => o.trim()).filter(Boolean);
          if (filled.length < 2) {
            setError(`"${q.prompt}" necesita al menos 2 opciones para ser de opción múltiple`);
            return;
          }
        }
      }

      const questionsPayload =
        moduleType === "question"
          ? usableQuestions.map(({ prompt, points, repeatable, input_type, options, image_id }) => ({
              prompt,
              points,
              repeatable,
              image_id,
              input_type,
              options:
                input_type === "multiple_choice"
                  ? options.map((o) => o.trim()).filter(Boolean)
                  : null,
            }))
          : [];

      const rewardOptionsPayload =
        moduleType === "reward_picker"
          ? rewards
              .filter((r) => r.label.trim())
              .map((r) => ({
                ...r,
                unlock_points: r.unlock_points === "" ? null : parseInt(r.unlock_points),
              }))
          : [];

      const customRewardLimitPayload =
        moduleType === "reward_picker" && customRewardLimit !== ""
          ? parseInt(customRewardLimit)
          : null;

      if (isEditing) {
        await api.updateModule(editingModule.id, {
          questions: questionsPayload,
          reward_options: rewardOptionsPayload,
          custom_reward_limit: customRewardLimitPayload,
        });
        onModuleAdded();
        onCancelEdit();
        return;
      }

      await api.createModule(experience.id, {
        type: moduleType,
        order_index: experience.modules?.length ?? 0,
        questions: questionsPayload,
        reward_options: rewardOptionsPayload,
        custom_reward_limit: customRewardLimitPayload,
      });
      onModuleAdded();
      setQuestions([{ ...EMPTY_QUESTION, options: [...EMPTY_QUESTION.options] }]);
      setRewards([{ ...EMPTY_REWARD }]);
      setCustomRewardLimit("");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="bg-void-2 border border-white/10 rounded-2xl p-6">
      <h3 className="font-display text-lg mb-4">{isEditing ? "Editar módulo" : "Agregar módulo"}</h3>
      {error && <p className="text-gem text-sm mb-2">{error}</p>}

      {!isEditing && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setModuleType("question")}
            className={`btn-ghost px-4 py-2 rounded-lg text-sm ${moduleType === "question" ? "bg-gem" : "bg-void border border-white/20"}`}
          >
            Preguntas
          </button>
          <button
            onClick={() => setModuleType("reward_picker")}
            className={`btn-ghost px-4 py-2 rounded-lg text-sm ${moduleType === "reward_picker" ? "bg-gem" : "bg-void border border-white/20"}`}
          >
            Recompensas
          </button>
        </div>
      )}

      {moduleType === "question" && (
        <div className="space-y-3 mb-4">
          {questions.map((q, i) => (
            <div key={i} className="border border-white/10 rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  value={q.prompt}
                  onChange={(e) => updateQuestion(i, "prompt", e.target.value)}
                  placeholder="Texto de la pregunta"
                  className="flex-1 rounded-lg border border-white/20 bg-void p-2 text-sm"
                />
                <input
                  type="number"
                  value={q.points}
                  onChange={(e) => updateQuestion(i, "points", parseInt(e.target.value) || 0)}
                  className="w-20 rounded-lg border border-white/20 bg-void p-2 text-sm"
                />
                <label className="flex items-center gap-1 text-xs text-parchment-dim whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={q.repeatable}
                    onChange={(e) => updateQuestion(i, "repeatable", e.target.checked)}
                  />
                  repetible
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => updateQuestion(i, "input_type", "text")}
                  className={`btn-ghost px-3 py-1.5 rounded-lg text-xs ${q.input_type === "text" ? "bg-raven" : "bg-void border border-white/20"}`}
                >
                  texto libre
                </button>
                <button
                  onClick={() => updateQuestion(i, "input_type", "multiple_choice")}
                  className={`btn-ghost px-3 py-1.5 rounded-lg text-xs ${q.input_type === "multiple_choice" ? "bg-raven" : "bg-void border border-white/20"}`}
                >
                  opción múltiple
                </button>
              </div>

              {q.input_type === "multiple_choice" && (
                <div className="space-y-1.5 pl-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex gap-2">
                      <input
                        value={opt}
                        onChange={(e) => updateOption(i, oi, e.target.value)}
                        placeholder={`Opción ${oi + 1}`}
                        className="flex-1 rounded-lg border border-white/20 bg-void p-1.5 text-sm"
                      />
                      {q.options.length > 2 && (
                        <button
                          onClick={() => removeOption(i, oi)}
                          className="btn-text text-xs text-gem"
                        >
                          quitar
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addOptionRow(i)}
                    className="btn-text text-xs text-raven-light underline"
                  >
                    + agregar opción
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3">
                {q.image_preview ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={resolveImageUrl(q.image_preview)}
                      alt=""
                      className="w-14 h-14 object-cover rounded-lg border border-white/20"
                    />
                    <button
                      onClick={() => handleImageRemove(i)}
                      className="btn-text text-xs text-gem underline"
                    >
                      quitar imagen
                    </button>
                  </div>
                ) : (
                  <label className="text-xs text-parchment-dim">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageSelect(i, e.target.files?.[0])}
                    />
                    <span className="btn-text underline cursor-pointer text-raven-light">
                      {q.uploading ? "subiendo..." : "+ imagen temática (opcional, máx 5MB)"}
                    </span>
                  </label>
                )}
              </div>
            </div>
          ))}
          <button onClick={addQuestionRow} className="btn-text text-xs text-raven-light underline">
            + agregar otra pregunta
          </button>
        </div>
      )}

      {moduleType === "reward_picker" && (
        <div className="space-y-3 mb-4">
          {rewards.map((r, i) => (
            <div key={i} className="border border-white/10 rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  value={r.icon}
                  onChange={(e) => updateReward(i, "icon", e.target.value)}
                  placeholder="🎁"
                  className="w-14 rounded-lg border border-white/20 bg-void p-2 text-sm text-center"
                />
                <input
                  value={r.label}
                  onChange={(e) => updateReward(i, "label", e.target.value)}
                  placeholder="Nombre"
                  className="flex-1 rounded-lg border border-white/20 bg-void p-2 text-sm"
                />
                <input
                  value={r.description}
                  onChange={(e) => updateReward(i, "description", e.target.value)}
                  placeholder="Descripción"
                  className="flex-1 rounded-lg border border-white/20 bg-void p-2 text-sm"
                />
                <input
                  type="number"
                  min={0}
                  value={r.unlock_points}
                  onChange={(e) => updateReward(i, "unlock_points", e.target.value)}
                  placeholder="pts mín."
                  title="Puntos mínimos para que esta recompensa aparezca (opcional, vacío = sin mínimo propio)"
                  className="w-20 rounded-lg border border-white/20 bg-void p-2 text-sm"
                />
              </div>
              <label className="flex items-center gap-1.5 text-xs text-parchment-dim">
                <input
                  type="checkbox"
                  checked={r.requires_datetime}
                  onChange={(e) => updateReward(i, "requires_datetime", e.target.checked)}
                />
                pedirle fecha y hora al jugador al confirmarla
              </label>
            </div>
          ))}
          <button onClick={addRewardRow} className="btn-text text-xs text-raven-light underline">
            + agregar otra recompensa
          </button>

          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            <label className="text-xs text-parchment-dim">
              Recompensas construibles por jugador (vacío = deshabilitado)
            </label>
            <input
              type="number"
              min={0}
              value={customRewardLimit}
              onChange={(e) => setCustomRewardLimit(e.target.value)}
              placeholder="0"
              title="Cuántas recompensas puede armar cada jugador con su propia carta personalizada"
              className="w-20 rounded-lg border border-white/20 bg-void p-2 text-sm"
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSubmit}
          className="btn-fill bg-gem px-5 py-2.5 rounded-xl font-semibold text-sm"
        >
          {isEditing ? "Guardar cambios" : "Guardar módulo"}
        </button>
        {isEditing && (
          <button
            onClick={onCancelEdit}
            className="btn-text text-parchment-dim text-sm"
          >
            cancelar
          </button>
        )}
      </div>
    </div>
  );
}
