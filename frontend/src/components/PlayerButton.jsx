export default function PlayerButton({ label, onClick, disabled }) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        fontFamily: "Inter,system-ui,sans-serif",
        fontWeight: 600,
        fontSize: 14,
        color: "var(--color-gem-light)",
        background: "color-mix(in srgb, var(--color-gem) 16%, transparent)",
        border: "1.5px solid var(--color-gem)",
        borderRadius: 10,
        padding: "13px 20px",
        boxShadow: "0 0 18px color-mix(in srgb, var(--color-gem) 30%, transparent)",
        cursor: disabled ? "not-allowed" : "pointer",
        width: "100%",
        opacity: disabled ? 0.4 : 1,
        transition: "transform 0.15s ease",
      }}
    >
      {label}
    </div>
  );
}
