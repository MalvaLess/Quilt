import { useState } from "react";
import { api } from "../../api/client";
import ColorPickerButton from "../../components/ColorPickerButton";

export default function CreateExperienceForm({ onCreated }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [themeColor, setThemeColor] = useState("#b3273e");
  const [description, setDescription] = useState("");
  const [rewardThreshold, setRewardThreshold] = useState(60);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!title.trim() || !slug.trim()) {
      setError("Título y slug son obligatorios");
      return;
    }
    try {
      const exp = await api.createExperience({
        title,
        slug,
        theme_color: themeColor,
        description,
        reward_threshold: rewardThreshold,
      });
      setTitle("");
      setSlug("");
      setDescription("");
      setRewardThreshold(60);
      onCreated(exp);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="bg-void-2 border border-white/10 rounded-2xl p-6 mb-8">
      <h2 className="font-display text-xl mb-4">Nueva experiencia</h2>
      {error && <p className="text-gem text-sm mb-2">{error}</p>}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          className="rounded-lg border border-white/20 bg-void p-2.5 text-sm"
        />
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="slug-sin-espacios"
          className="rounded-lg border border-white/20 bg-void p-2.5 text-sm"
        />
      </div>
      <div className="flex gap-3 mb-3 items-center">
        <label className="text-sm text-parchment-dim">Color tema</label>
        <ColorPickerButton value={themeColor} onChange={setThemeColor} />
        <label className="text-sm text-parchment-dim ml-4">
          Puntos para desbloquear recompensas
        </label>
        <input
          type="number"
          min={0}
          value={rewardThreshold}
          onChange={(e) => setRewardThreshold(parseInt(e.target.value) || 0)}
          className="w-24 rounded-lg border border-white/20 bg-void p-2 text-sm"
        />
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción (opcional)"
        className="w-full rounded-lg border border-white/20 bg-void p-2.5 text-sm mb-4 resize-none"
        rows={2}
      />
      <button
        onClick={handleSubmit}
        className="btn-fill bg-gem px-5 py-2.5 rounded-xl font-semibold text-sm"
      >
        Crear experiencia
      </button>
    </div>
  );
}