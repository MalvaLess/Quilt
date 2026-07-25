import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, resolveImageUrl } from "../../api/client";
import CreateExperienceForm from "./CreateExperienceForm";
import EditExperienceForm from "./EditExperienceForm";
import ModuleBuilder from "./ModuleBuilder";
import ShareCodeCard from "./ShareCodeCard";
import { PencilIcon, TrashIcon } from "../../components/icons";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState([]);
  const [players, setPlayers] = useState(null);
  const [selectedExp, setSelectedExp] = useState(null);
  const [fullExperience, setFullExperience] = useState(null);
  const [expandedPlayer, setExpandedPlayer] = useState(null);
  const [tab, setTab] = useState("build"); // build | results
  const [loadError, setLoadError] = useState(null);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [moduleError, setModuleError] = useState(null);

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
  }, []);

  const selectExperience = async (exp) => {
    setSelectedExp(exp);
    setExpandedPlayer(null);
    setEditingModuleId(null);
    setTab("build");
    const full = await api.getExperienceFull(exp.id);
    setFullExperience(full);
  };

  const refreshFullExperience = async () => {
    if (selectedExp) {
      const full = await api.getExperienceFull(selectedExp.id);
      setFullExperience(full);
    }
  };

  const viewResults = async () => {
    setTab("results");
    const data = await api.getPlayers(selectedExp.id);
    setPlayers(data);
  };

  const handleUpdated = (updated) => {
    setSelectedExp(updated);
    setExperiences((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setFullExperience((prev) => (prev ? { ...prev, ...updated } : prev));
  };

  const handleDeleted = (id) => {
    setExperiences((prev) => prev.filter((e) => e.id !== id));
    setSelectedExp(null);
    setFullExperience(null);
    setPlayers(null);
  };

  const handleDeleteModule = async (moduleId) => {
    if (!confirm("¿Borrar este módulo? Esto elimina también sus preguntas o recompensas.")) {
      return;
    }
    setModuleError(null);
    try {
      await api.deleteModule(moduleId);
      if (editingModuleId === moduleId) setEditingModuleId(null);
      await refreshFullExperience();
    } catch (e) {
      setModuleError(e.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("quilt_token");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen text-parchment font-sans p-8 relative overflow-hidden">
      <div className="glow-blob absolute -top-24 right-[15%] w-80 h-80 rounded-full bg-gem opacity-10 -z-10" />
      <div className="flex items-center justify-between mb-6 screen-enter">
        <h1 className="font-display text-2xl">Tus experiencias</h1>
        <button
          onClick={handleLogout}
          className="btn-ghost text-sm text-parchment-dim border border-white/20 rounded-lg px-3 py-1.5 hover:border-gem hover:text-parchment transition-colors"
        >
          Cerrar sesión
        </button>
      </div>

      {loadError && (
        <p className="text-gem text-sm mb-4">
          No se pudieron cargar tus experiencias: {loadError}
        </p>
      )}

      <CreateExperienceForm
        onCreated={(exp) => {
          loadExperiences();
          selectExperience(exp);
        }}
      />

      <div className="flex gap-3 flex-wrap mb-6">
        {experiences.map((exp) => (
          <button
            key={exp.id}
            onClick={() => selectExperience(exp)}
            className={`btn-ghost border rounded-xl px-4 py-2 text-sm ${
              selectedExp?.id === exp.id ? "border-gem bg-void-2" : "border-white/10 bg-void-2"
            }`}
          >
            {exp.title}
          </button>
        ))}
      </div>

      {selectedExp && (
        <>
          <ShareCodeCard slug={selectedExp.slug} />

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab("build")}
              className={`btn-ghost px-4 py-2 rounded-lg text-sm ${tab === "build" ? "bg-raven" : "bg-void-2 border border-white/10"}`}
            >
              Construir
            </button>
            <button
              onClick={viewResults}
              className={`btn-ghost px-4 py-2 rounded-lg text-sm ${tab === "results" ? "bg-raven" : "bg-void-2 border border-white/10"}`}
            >
              Resultados
            </button>
          </div>

          {tab === "build" && fullExperience && (
            <div className="space-y-6">
              <EditExperienceForm
                experience={fullExperience}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
              <div>
                <h2 className="font-display text-xl mb-3">Módulos actuales</h2>
                <p className="text-parchment-dim text-xs mb-3">
                  Recompensas desbloqueadas desde {fullExperience.reward_threshold} pts (podés
                  darle a cada recompensa su propio mínimo más alto).
                </p>
                {fullExperience.modules.length === 0 && (
                  <p className="text-parchment-dim text-sm mb-4">Todavía no hay módulos.</p>
                )}
                {moduleError && <p className="text-gem text-sm mb-3">{moduleError}</p>}
                {fullExperience.modules.map((m) => (
                  <div key={m.id} className="mb-2">
                    <div className="bg-void-2 border border-white/10 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-mono text-xs text-mustard uppercase">{m.type}</p>
                        <div className="flex gap-1 -mt-1 -mr-1">
                          <button
                            onClick={() =>
                              setEditingModuleId(editingModuleId === m.id ? null : m.id)
                            }
                            title="Editar módulo"
                            className={`icon-btn p-1.5 rounded-lg ${
                              editingModuleId === m.id
                                ? "text-gem bg-white/10"
                                : "text-parchment-dim"
                            }`}
                          >
                            <PencilIcon />
                          </button>
                          <button
                            onClick={() => handleDeleteModule(m.id)}
                            title="Borrar módulo"
                            className="icon-btn p-1.5 rounded-lg text-parchment-dim hover:text-gem"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                      {m.questions.map((q) => (
                        <div key={q.id} className="flex items-center gap-2 text-sm">
                          {q.image_url && (
                            <img
                              src={resolveImageUrl(q.image_url)}
                              alt=""
                              className="w-8 h-8 object-cover rounded border border-white/20"
                            />
                          )}
                          <p>
                            {q.prompt} <span className="text-parchment-dim">({q.points} pts{q.repeatable ? ", repetible" : ""})</span>
                          </p>
                        </div>
                      ))}
                      {m.reward_options.map((r) => (
                        <p key={r.id} className="text-sm">
                          {r.icon} {r.label} {r.requires_datetime && "📅"} — <span className="text-parchment-dim">
                            {r.description}
                            {r.unlock_points != null && ` (desde ${r.unlock_points} pts)`}
                          </span>
                        </p>
                      ))}
                    </div>

                    {editingModuleId === m.id && (
                      <div className="mt-2">
                        <ModuleBuilder
                          key={`edit-${m.id}`}
                          experience={fullExperience}
                          editingModule={m}
                          onModuleAdded={refreshFullExperience}
                          onCancelEdit={() => setEditingModuleId(null)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <ModuleBuilder experience={fullExperience} onModuleAdded={refreshFullExperience} />
            </div>
          )}

          {tab === "results" && players && (
            <div className="space-y-2">
              {players.length === 0 && (
                <p className="text-parchment-dim text-sm">Todavía nadie jugó esta experiencia.</p>
              )}
              {players.map((p) => (
                <div key={p.id} className="bg-void-2 border border-white/10 rounded-xl">
                  <button
                    onClick={() => setExpandedPlayer(expandedPlayer === p.id ? null : p.id)}
                    className="btn-ghost w-full flex justify-between items-center px-4 py-3 text-sm rounded-xl"
                  >
                    <span>{p.name}</span>
                    <span className="flex items-center gap-4">
                      <span className="text-mustard font-mono">{p.total_points} pts</span>
                      <span className="text-parchment-dim">{p.reward_chosen || "sin recompensa"}</span>
                    </span>
                  </button>
                  {expandedPlayer === p.id && (
                    <div className="border-t border-white/10 px-4 py-3 space-y-2">
                      {p.answers.map((a, i) => (
                        <div key={i} className="text-sm">
                          <p className="text-parchment-dim font-mono text-xs">{a.prompt}</p>
                          {a.skipped ? (
                            <p className="text-parchment-dim italic">(saltada)</p>
                          ) : (
                            <p>{a.response}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}