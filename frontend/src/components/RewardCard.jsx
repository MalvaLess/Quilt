export default function RewardCard({ reward, isSelected, onSelect }) {
  return (
    <div
      className="tile-interactive [perspective:800px] h-32"
      onClick={() => onSelect(reward.id)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] cursor-pointer ${
          isSelected
            ? "[transform:rotateY(180deg)] outline outline-2 outline-gem outline-offset-2 rounded-2xl"
            : ""
        }`}
      >
        {/* front */}
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl bg-void-2 border border-white/15 flex flex-col items-center justify-center gap-1.5 text-center p-3">
          <span className="text-2xl">{reward.icon}</span>
          <span className="font-display text-sm uppercase text-parchment">
            {reward.label}
          </span>
        </div>
        {/* back */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl bg-mustard text-void-2 text-[11.5px] leading-snug p-3 flex items-center">
          {reward.description}
        </div>
      </div>
    </div>
  );
}
