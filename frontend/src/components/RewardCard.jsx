const FLIP_DURATION_MS = 600;
const FADE_DURATION_MS = 200;
const FADE_IN_DELAY_MS = 350;

export default function RewardCard({ reward, isSelected, onSelect }) {
  const contentTransition = (visible) =>
    visible ? `opacity ${FADE_DURATION_MS}ms ease ${FADE_IN_DELAY_MS}ms` : `opacity ${FADE_DURATION_MS}ms ease`;

  return (
    <div onClick={() => onSelect(reward.id)} style={{ perspective: 1000, height: 140, cursor: "pointer", isolation: "isolate", transform: "translateZ(0)" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transition: `transform ${FLIP_DURATION_MS}ms cubic-bezier(0.4,0,0.2,1)`,
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
          willChange: "transform",
          transform: isSelected ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              opacity: isSelected ? 0 : 1,
              transition: contentTransition(!isSelected),
            }}
          >
            <div style={{ fontSize: 28 }}>{reward.icon}</div>
            <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 14, textAlign: "center" }}>{reward.label}</div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
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
          <div
            style={{
              opacity: isSelected ? 1 : 0,
              transition: contentTransition(isSelected),
            }}
          >
            <div style={{ fontSize: 11.5, color: "var(--color-gem-light)", textAlign: "center", lineHeight: 1.4 }}>{reward.description}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
