export default function SelectableOption({ label, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={
        selected
          ? {
              fontSize: 14,
              padding: "13px 14px",
              borderRadius: 9,
              cursor: "pointer",
              background: "color-mix(in srgb, var(--color-gem) 14%, transparent)",
              border: "1.5px solid var(--color-gem)",
              color: "var(--color-gem-light)",
              fontWeight: 600,
            }
          : {
              fontSize: 14,
              padding: "13px 14px",
              borderRadius: 9,
              cursor: "pointer",
              background: "rgba(255,255,255,0.04)",
              border: "1.5px solid rgba(255,255,255,0.14)",
              color: "#e9e9ed",
            }
      }
    >
      {label}
    </div>
  );
}
