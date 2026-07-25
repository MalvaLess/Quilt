export default function CoverScreen({ onStart }) {
  return (
    <div className="bg-void-2 border border-white/10 rounded-[18px] p-8 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-gem opacity-20" />

      <span className="font-mono text-xs tracking-widest uppercase text-mustard block mb-2.5 relative z-10">
        nivel 1 · desbloqueá una cita
      </span>
      <h1 className="font-display uppercase leading-none text-parchment relative z-10 text-[38px]">
        un juego
        <br />
        <span className="text-gem">solo para tí</span>
      </h1>
      <p className="text-parchment-dim text-[15px] leading-relaxed mt-3.5 relative z-10">
        Contestá algunas preguntas — no importa qué digas, siempre sumás puntos.
        Cuando juntes suficientes, elegís vos misma la cita.
      </p>

      <div className="flex gap-1.5 mt-5 flex-wrap relative z-10">
        <span className="font-mono text-[11px] border border-white/25 text-parchment-dim px-2.5 py-1 rounded-full">
          preguntas al azar
        </span>
        <span className="font-mono text-[11px] border border-white/25 text-parchment-dim px-2.5 py-1 rounded-full">
          vos elegís el premio
        </span>
      </div>

      <button
        onClick={onStart}
        className="btn-fill w-full mt-6 bg-gem text-parchment font-semibold rounded-xl py-3.5 shadow-[0_6px_0_var(--color-gem-dark)] active:translate-y-1 active:shadow-[0_2px_0_var(--color-gem-dark)] transition-transform relative z-10"
      >
        Empezar »
      </button>
    </div>
  );
}