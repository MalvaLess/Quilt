import { useState } from "react";
import { api } from "../../api/client";
import ColorPickerButton from "../../components/ColorPickerButton";

export default function EditExperienceForm({ experience, onUpdated, onDeleted }) {
  const [title, setTitle] = useState(experience.title);
  const [slug, setSlug] = useState(experience.slug);
  const [themeColor, setThemeColor] = useState(experience.theme_color || "#b3273e");
  const [description, setDescription] = useState(experience.description || "");
  const [rewardThreshold, setRewardThreshold] = useState(experience.reward_threshold);
  const [status, setStatus] = useState(experience.status);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      setError("Título y slug son obligatorios");
      return;
    }
    try {
      const updated = await api.updateExperience(experience.id, {
        title,
        slug,
        theme_color: themeColor,
        description,
        reward_threshold: rewardThreshold,
        status,
      });
      onUpdated(updated);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Borrar "${experience.title}"? Esto elimina también sus módulos y jugadores.`)) {
      return;
    }
    try {
      await api.deleteExperience(experience.id);
      onDeleted(experience.id);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="bg-void-2 border border-white/10 rounded-2xl p-6 mb-6">
      <h2 className="font-display text-xl mb-4">Editar experiencia</h2>
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
      <div className="flex gap-3 mb-3 items-center flex-wrap">
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
        <label className="text-sm text-parchment-dim ml-4">Estado</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-white/20 bg-void p-2 text-sm"
        >
          <option value="draft">draft</option>
          <option value="published">published</option>
        </select>
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción (opcional)"
        className="w-full rounded-lg border border-white/20 bg-void p-2.5 text-sm mb-4 resize-none"
        rows={2}
      />
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="btn-fill bg-gem px-5 py-2.5 rounded-xl font-semibold text-sm"
        >
          Guardar cambios
        </button>
        <button
          onClick={handleDelete}
          className="btn-ghost border border-gem text-gem px-5 py-2.5 rounded-xl font-semibold text-sm"
        >
          Borrar experiencia
        </button>
      </div>
    </div>
  );
}
