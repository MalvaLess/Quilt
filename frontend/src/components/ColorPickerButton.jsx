import { useEffect, useRef, useState } from "react";

const PRESET_COLORS = [
  "#b3273e",
  "#8f1e30",
  "#e8a33d",
  "#c2185b",
  "#d84315",
  "#7c5cc7",
  "#4c2f7a",
  "#5e35b1",
  "#1f6fb2",
  "#00897b",
  "#2f6f5e",
  "#37474f",
];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export default function ColorPickerButton({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value);
  const ref = useRef(null);

  const toggleOpen = () => {
    if (!open) setHexInput(value);
    setOpen(!open);
  };

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const applyHex = (hex) => {
    setHexInput(hex);
    if (HEX_RE.test(hex)) onChange(hex);
  };

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={toggleOpen}
        className="btn-ghost flex items-center gap-2 rounded-lg border border-white/20 bg-void px-3 py-2 text-sm"
      >
        <span
          className="w-5 h-5 rounded-full border border-white/30 shrink-0"
          style={{ backgroundColor: HEX_RE.test(value) ? value : "#000" }}
        />
        <span className="font-mono text-xs text-parchment-dim">{value}</span>
      </button>

      {open && (
        <div className="screen-enter absolute z-20 mt-2 p-3 bg-void-2 border border-white/15 rounded-xl shadow-2xl w-56">
          <div className="grid grid-cols-6 gap-2 mb-3">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                className="tile-interactive w-7 h-7 rounded-full border-2"
                style={{
                  backgroundColor: c,
                  borderColor: c.toLowerCase() === value.toLowerCase() ? "#fff" : "transparent",
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={hexInput}
              onChange={(e) => applyHex(e.target.value)}
              placeholder="#rrggbb"
              className="flex-1 min-w-0 rounded-lg border border-white/20 bg-void px-2 py-1.5 text-xs font-mono"
            />
            <label
              title="Selector de color completo"
              className="icon-btn w-7 h-7 rounded-lg border border-white/20 flex items-center justify-center shrink-0 cursor-pointer text-sm"
            >
              🎨
              <input
                type="color"
                value={HEX_RE.test(value) ? value : "#b3273e"}
                onChange={(e) => {
                  setHexInput(e.target.value);
                  onChange(e.target.value);
                }}
                className="sr-only"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
