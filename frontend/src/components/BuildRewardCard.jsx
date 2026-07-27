export default function BuildRewardCard({ active, onOpen }) {
  return (
    <div
      onClick={onOpen}
      style={{
        height: 140,
        borderRadius: 14,
        border: active ? "1.5px dashed var(--color-gem)" : "1.5px dashed rgba(255,255,255,0.2)",
        background: active ? "color-mix(in srgb, var(--color-gem) 8%, transparent)" : "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: 22 }}>✨</div>
      <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 13, color: active ? "var(--color-gem-light)" : "#e9e9ed" }}>
        Creá la tuya
      </div>
    </div>
  );
}
