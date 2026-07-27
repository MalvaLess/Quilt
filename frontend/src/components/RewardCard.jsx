export default function RewardCard({ reward, isSelected, onSelect }) {
  return (
    <div onClick={() => onSelect(reward.id)} style={{ perspective: 1000, height: 140, cursor: "pointer" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
          transformStyle: "preserve-3d",
          transform: isSelected ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            borderRadius: 14,
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 28 }}>{reward.icon}</div>
          <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 14, textAlign: "center" }}>{reward.label}</div>
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderRadius: 14,
            background: "color-mix(in srgb, var(--color-gem) 10%, transparent)",
            border: "1.5px solid var(--color-gem)",
            boxShadow: "0 0 22px color-mix(in srgb, var(--color-gem) 30%, transparent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 14,
          }}
        >
          <div style={{ fontSize: 11.5, color: "var(--color-gem-light)", textAlign: "center", lineHeight: 1.4 }}>{reward.description}</div>
        </div>
      </div>
    </div>
  );
}
