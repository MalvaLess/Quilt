import { useState } from "react";

export default function NameGate({ onSubmit }) {
  const [name, setName] = useState("");

  return (
    <div className="bg-void-2 border border-white/10 rounded-[18px] p-8 screen-enter">
      <span className="font-mono text-xs tracking-widest uppercase text-mustard block mb-2.5">
        antes de arrancar
      </span>
      <h1 className="font-display text-2xl text-parchment mb-4">¿Cómo te llamás?</h1>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="tu nombre..."
        className="w-full rounded-lg border border-white/20 bg-void p-3 text-parchment text-sm focus:outline-none focus:border-gem"
      />
      <button
        onClick={() => name.trim() && onSubmit(name.trim())}
        className="btn-fill w-full mt-4 bg-gem text-parchment font-semibold rounded-xl py-3.5 shadow-[0_6px_0_var(--color-gem-dark)] active:translate-y-1 active:shadow-[0_2px_0_var(--color-gem-dark)] transition-transform"
      >
        Continuar »
      </button>
    </div>
  );
}