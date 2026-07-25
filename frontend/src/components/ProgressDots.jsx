export default function ProgressDots({ totalPoints, pointsPerQuestion, neededPoints }) {
  const totalDots = Math.ceil(neededPoints / pointsPerQuestion);
  const filled = Math.floor(totalPoints / pointsPerQuestion);

  return (
    <div className="flex gap-1.5">
      {Array.from({ length: totalDots }).map((_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full border ${
            i < filled
              ? "bg-mustard border-mustard"
              : "bg-white/10 border-white/25"
          }`}
        />
      ))}
    </div>
  );
}