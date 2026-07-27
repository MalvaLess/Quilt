export default function PointsBar({ points, neededPoints }) {
  const percent = neededPoints > 0 ? Math.min(100, Math.round((points / neededPoints) * 100)) : 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
        <div style={{ width: `${percent}%`, height: "100%", background: "var(--color-gem)" }} />
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-gem-light)", whiteSpace: "nowrap" }}>{points} pts</div>
    </div>
  );
}
