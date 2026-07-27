import { useEffect, useRef, useState } from "react";

const PRESET_COLORS = [
  "#ff2d4f",
  "#a31f3a",
  "#e8b13a",
  "#d1237a",
  "#e0672a",
  "#6c5ce7",
  "#4b3f9e",
  "#7d3fe0",
  "#2f8fd1",
  "#16a37a",
  "#2f9e6e",
  "#345b52",
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
    <div style={{ position: "relative", display: "inline-block" }} ref={ref}>
      <div
        onClick={toggleOpen}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.14)", cursor: "pointer" }}
      >
        <div style={{ width: 18, height: 18, borderRadius: "50%", background: HEX_RE.test(value) ? value : "#000", border: "1px solid rgba(255,255,255,0.2)" }} />
        <div style={{ fontSize: 13, fontFamily: "monospace" }}>{value}</div>
      </div>

      {open && (
        <div style={{ position: "absolute", top: 70, left: 0, zIndex: 10, background: "#130f11", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: 14, boxShadow: "0 16px 40px rgba(0,0,0,0.5)", width: 260 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8, marginBottom: 12 }}>
            {PRESET_COLORS.map((c) => (
              <div
                key={c}
                title={c}
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer", border: `2px solid ${c.toLowerCase() === value.toLowerCase() ? "#fff" : "transparent"}` }}
              />
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              value={hexInput}
              onChange={(e) => applyHex(e.target.value)}
              style={{ flex: 1, height: 36, padding: "0 10px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.14)", color: "#e9e9ed", fontSize: 12, fontFamily: "monospace" }}
            />
            <input
              type="color"
              value={HEX_RE.test(value) ? value : "#ff2d4f"}
              onChange={(e) => {
                setHexInput(e.target.value);
                onChange(e.target.value);
              }}
              style={{ width: 36, height: 36, padding: 0, borderRadius: 8, border: "1px solid rgba(255,255,255,0.14)", background: "none", cursor: "pointer" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
