export default function PatchCard({ tag, response, rotation }) {
  const shortResponse =
    response && response.length > 60 ? response.slice(0, 60) + "…" : response;

  return (
    <div
      className="bg-parchment text-void-2 font-mono text-[10.5px] leading-snug p-2 rounded max-w-[128px] shadow-md border-l-[3px] border-gem animate-[pin_0.4s_ease]"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <b className="block text-gem-dark uppercase text-[9px] mb-1">{tag}</b>
      {shortResponse || "(sin respuesta escrita)"}
    </div>
  );
}