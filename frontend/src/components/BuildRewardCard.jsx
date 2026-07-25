export default function BuildRewardCard({ remaining, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="tile-interactive h-32 rounded-2xl border-2 border-dashed border-white/25 flex flex-col items-center justify-center gap-1 text-center p-3 text-parchment-dim hover:border-gem hover:text-parchment transition-colors"
    >
      <span className="text-2xl">✨</span>
      <span className="font-display text-sm uppercase">Crear la mía</span>
      <span className="text-[10px]">quedan {remaining}</span>
    </button>
  );
}
