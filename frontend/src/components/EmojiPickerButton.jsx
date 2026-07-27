import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { EMOJI_DATA } from "./emojiData";

const COLUMNS = 6;
const ROWS = 4;
const PAGE_SIZE = COLUMNS * ROWS;

export default function EmojiPickerButton({ value, onChange }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const buttonRef = useRef(null);
  const popoverRef = useRef(null);

  const toggleOpen = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 6, left: rect.left });
      setQuery("");
      setPage(0);
    }
    setOpen(!open);
  };

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target) &&
        popoverRef.current && !popoverRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EMOJI_DATA;
    return EMOJI_DATA.filter((item) => item.e === query || item.k.includes(q));
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div
        ref={buttonRef}
        onClick={toggleOpen}
        title={t("dashboardPage.chooseEmoji")}
        style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, cursor: "pointer" }}
      >
        {value || "🎁"}
      </div>

      {open &&
        createPortal(
          <div
            ref={popoverRef}
            style={{ position: "fixed", top: coords.top, left: coords.left, zIndex: 1000, background: "#130f11", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: 12, boxShadow: "0 16px 40px rgba(0,0,0,0.5)", width: 260 }}
          >
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder={t("dashboardPage.searchEmojiPlaceholder")}
              style={{ width: "100%", height: 34, padding: "0 10px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.14)", color: "#e9e9ed", fontSize: 13, boxSizing: "border-box", marginBottom: 10 }}
            />

            <div style={{ display: "grid", gridTemplateColumns: `repeat(${COLUMNS},1fr)`, gap: 6, minHeight: ROWS * 34 }}>
              {pageItems.map((item) => (
                <div
                  key={item.e}
                  onClick={() => {
                    onChange(item.e);
                    setOpen(false);
                  }}
                  title={item.k.split(" ")[0]}
                  style={{ fontSize: 18, textAlign: "center", padding: 4, borderRadius: 6, cursor: "pointer", background: item.e === value ? "rgba(255,45,79,0.18)" : "transparent" }}
                >
                  {item.e}
                </div>
              ))}
              {pageItems.length === 0 && (
                <div style={{ gridColumn: `span ${COLUMNS}`, textAlign: "center", fontSize: 12, color: "rgba(233,233,237,0.5)", padding: "12px 0" }}>
                  {t("dashboardPage.noEmojiResults")}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                <i
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="fa-solid fa-chevron-left"
                  style={{ fontSize: 11, padding: 6, cursor: safePage === 0 ? "default" : "pointer", color: safePage === 0 ? "rgba(233,233,237,0.25)" : "rgba(233,233,237,0.6)" }}
                />
                <div style={{ fontSize: 11, color: "rgba(233,233,237,0.5)" }}>{safePage + 1} / {totalPages}</div>
                <i
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  className="fa-solid fa-chevron-right"
                  style={{ fontSize: 11, padding: 6, cursor: safePage === totalPages - 1 ? "default" : "pointer", color: safePage === totalPages - 1 ? "rgba(233,233,237,0.25)" : "rgba(233,233,237,0.6)" }}
                />
              </div>
            )}

            <input
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder={t("dashboardPage.customEmojiPlaceholder")}
              style={{ width: "100%", height: 34, padding: "0 10px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.14)", color: "#e9e9ed", fontSize: 14, boxSizing: "border-box", marginTop: 10 }}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
