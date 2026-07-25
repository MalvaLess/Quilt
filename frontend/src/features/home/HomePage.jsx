import { useState } from "react";
import { useNavigate } from "react-router-dom";

function parseSlug(input) {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const withoutQuery = trimmed.split("?")[0].split("#")[0];
  const segments = withoutQuery.split("/").filter(Boolean);
  return segments[segments.length - 1];
}

export default function HomePage() {
  const [mode, setMode] = useState(null); // null | "player" | "creator"
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handlePlayerSubmit = () => {
    const slug = parseSlug(code);
    if (!slug) {
      setError("Ingresá un código o un enlace válido");
      return;
    }
    navigate(`/play/${slug}`);
  };

  return (
    <div className="min-h-screen text-parchment font-sans flex items-center justify-center p-6 relative overflow-hidden">
      <div className="glow-blob absolute top-[10%] -left-20 w-72 h-72 rounded-full bg-gem opacity-20" />
      <div className="glow-blob-alt absolute bottom-[10%] -right-20 w-72 h-72 rounded-full bg-mustard opacity-15" />
      <div className="w-full max-w-sm bg-void-2 border border-white/10 rounded-2xl p-8 screen-enter relative">
        <h1 className="font-display text-2xl mb-1">Quilt</h1>
        <p className="text-parchment-dim text-sm mb-6">
          Experiencias interactivas hechas a medida.
        </p>

        {mode === null && (
          <div className="space-y-3">
            <button
              onClick={() => setMode("player")}
              className="btn-fill w-full bg-gem text-parchment font-semibold rounded-xl py-3.5"
            >
              Soy jugador
            </button>
            <button
              onClick={() => setMode("creator")}
              className="btn-ghost w-full border border-white/20 rounded-xl py-3.5 font-semibold"
            >
              Soy creador
            </button>
          </div>
        )}

        {mode === "player" && (
          <div className="space-y-3">
            {error && <p className="text-gem text-sm">{error}</p>}
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="código o enlace de tu experiencia"
              className="w-full rounded-lg border border-white/20 bg-void p-3 text-sm focus:outline-none focus:border-gem"
            />
            <button
              onClick={handlePlayerSubmit}
              className="btn-fill w-full bg-gem text-parchment font-semibold rounded-xl py-3.5"
            >
              Entrar »
            </button>
            <button
              onClick={() => setMode(null)}
              className="btn-text w-full text-parchment-dim text-xs underline"
            >
              volver
            </button>
          </div>
        )}

        {mode === "creator" && (
          <div className="space-y-3">
            <button
              onClick={() => navigate("/login")}
              className="btn-fill w-full bg-gem text-parchment font-semibold rounded-xl py-3.5"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => navigate("/register")}
              className="btn-ghost w-full border border-white/20 rounded-xl py-3.5 font-semibold"
            >
              Crear cuenta
            </button>
            <button
              onClick={() => setMode(null)}
              className="btn-text w-full text-parchment-dim text-xs underline"
            >
              volver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
