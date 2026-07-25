import { useState } from "react";

export default function ShareCodeCard({ slug }) {
  const [hidden, setHidden] = useState(true);
  const [copiedField, setCopiedField] = useState(null); // null | "code" | "link"
  const link = `${window.location.origin}/play/${slug}`;

  const handleCopy = async (field, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 1500);
    } catch {
      // clipboard no disponible, no rompemos la UI por esto
    }
  };

  return (
    <div className="bg-void-2 border border-white/10 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg">Código para tus jugadores</h2>
        <button
          onClick={() => setHidden(!hidden)}
          className="btn-ghost text-xs text-parchment-dim border border-white/20 rounded-lg px-3 py-1.5 hover:border-gem hover:text-parchment transition-colors"
        >
          {hidden ? "mostrar" : "ocultar"}
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-parchment-dim w-16 shrink-0">código</span>
          <code
            className={`flex-1 font-mono text-sm bg-void rounded-lg px-3 py-2 border border-white/10 select-none ${
              hidden ? "blur-sm" : ""
            }`}
          >
            {slug}
          </code>
          <button
            onClick={() => handleCopy("code", slug)}
            className="btn-fill text-xs bg-gem px-3 py-2 rounded-lg font-semibold whitespace-nowrap"
          >
            {copiedField === "code" ? "copiado" : "copiar"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-parchment-dim w-16 shrink-0">enlace</span>
          <code
            className={`flex-1 font-mono text-xs bg-void rounded-lg px-3 py-2 border border-white/10 select-none truncate ${
              hidden ? "blur-sm" : ""
            }`}
          >
            {link}
          </code>
          <button
            onClick={() => handleCopy("link", link)}
            className="btn-fill text-xs bg-gem px-3 py-2 rounded-lg font-semibold whitespace-nowrap"
          >
            {copiedField === "link" ? "copiado" : "copiar"}
          </button>
        </div>
      </div>
    </div>
  );
}
