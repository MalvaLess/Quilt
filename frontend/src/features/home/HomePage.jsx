import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoMark from "../../assets/quilt-logo-mark.png";
import { api, clearApiCache } from "../../api/client";
import Logo from "../../components/Logo";
import SiteBackground from "../../components/SiteBackground";
import { useLanguage } from "../../i18n/LanguageContext";
import useIsMobile from "../../hooks/useIsMobile";

function parseSlug(input) {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const withoutQuery = trimmed.split("?")[0].split("#")[0];
  const segments = withoutQuery.split("/").filter(Boolean);
  return segments[segments.length - 1];
}

const BUILT_WITH = [
  { icon: "devicon-python-plain", title: "Python" },
  { icon: "devicon-fastapi-plain", title: "FastAPI" },
  { icon: "devicon-postgresql-plain", title: "PostgreSQL" },
  { icon: "fa-solid fa-layer-group", title: "SQLAlchemy" },
  { icon: "fa-solid fa-code-branch", title: "Alembic" },
  { icon: "fa-solid fa-shield-halved", title: "Pydantic" },
  { icon: "devicon-react-plain", title: "React" },
  { icon: "devicon-vitejs-plain", title: "Vite" },
  { icon: "devicon-tailwindcss-plain", title: "Tailwind CSS" },
  { icon: "devicon-javascript-plain", title: "JavaScript" },
  { icon: "devicon-html5-plain", title: "HTML5" },
  { icon: "devicon-css3-plain", title: "CSS" },
  { icon: "devicon-docker-plain", title: "Docker" },
];

function useCarousel(length, intervalMs = 3200) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % length), intervalMs);
    return () => clearInterval(id);
  }, [length, intervalMs]);
  return active;
}

const ACRYLIC_PANEL = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
};

function slotStyle(index, active, length, gap) {
  const slot = (index - active + length) % length;
  const base = {
    position: "absolute",
    top: 0,
    width: "31%",
    padding: 24,
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    gap,
    transition:
      "left 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1), opacity 0.7s ease",
  };
  if (slot === 0) {
    return {
      ...base,
      left: "34%",
      background: "rgba(255,45,79,0.05)",
      border: "1px solid rgba(255,45,79,0.5)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.45), 0 0 24px rgba(255,45,79,0.15)",
      transform: "scale(1.05)",
      zIndex: 3,
    };
  }
  return {
    ...base,
    left: slot === 1 ? "68%" : "0%",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.08)",
    transform: "scale(0.9)",
    opacity: 0.7,
    zIndex: 1,
  };
}

function NavDropdown({ label, icon, open, onEnter, onLeave, children }) {
  return (
    <div style={{ position: "relative", paddingBottom: 16, marginBottom: -16 }} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14, color: "#e9e9ed", cursor: "pointer", padding: "6px 2px" }}>
        <i className={icon} style={{ fontSize: 12, color: "rgba(233,233,237,0.6)" }} /> {label}{" "}
        <i className="fa-solid fa-chevron-down" style={{ fontSize: 9, color: "rgba(233,233,237,0.5)" }} />
      </div>
      {open && (
        <div style={{ position: "absolute", top: 44, left: 0, width: 260, background: "#130f11", border: "1px solid rgba(233,233,237,0.1)", borderRadius: 12, padding: 8, boxShadow: "0 16px 40px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", gap: 2 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function DropdownItem({ href, icon, title, desc }) {
  return (
    <a
      href={href}
      style={{ display: "flex", gap: 12, padding: 10, borderRadius: 8 }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(233,233,237,0.09)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <i className={icon} style={{ fontSize: 15, color: "rgba(233,233,237,0.6)", marginTop: 2 }} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#e9e9ed" }}>{title}</div>
        <div style={{ fontSize: 11, color: "rgba(233,233,237,0.55)", marginTop: 2 }}>{desc}</div>
      </div>
    </a>
  );
}

function BrowserChrome({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "#1f151a" }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(233,233,237,0.14)" }} />
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(233,233,237,0.14)" }} />
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(233,233,237,0.14)" }} />
      <div style={{ fontSize: 12, color: "rgba(233,233,237,0.55)", marginLeft: 12 }}>{label}</div>
    </div>
  );
}

function HoverLink({ to, children, style, hoverStyle }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      to={to}
      style={{ ...style, ...(hover ? hoverStyle : null) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </Link>
  );
}

function HoverAnchor({ href, onClick, children, style, hoverStyle }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      onClick={onClick}
      style={{ ...style, ...(hover ? hoverStyle : null) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </a>
  );
}

const primaryBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontFamily: "Inter,system-ui,sans-serif",
  fontWeight: 600,
  fontSize: 15,
  color: "#ffb3c0",
  background: "rgba(255,45,79,0.16)",
  border: "1.5px solid #ff2d4f",
  borderRadius: 8,
  padding: "12px 24px",
  boxShadow: "0 0 28px rgba(255,45,79,0.3)",
  transition: "transform 0.2s ease, background 0.2s ease",
};
const primaryBtnHover = { background: "rgba(255,45,79,0.3)", transform: "scale(1.06)" };
const ghostBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontFamily: "Inter,system-ui,sans-serif",
  fontWeight: 500,
  fontSize: 15,
  color: "#e9e9ed",
  border: "1px solid rgba(233,233,237,0.16)",
  borderRadius: 8,
  padding: "12px 24px",
  transition: "transform 0.2s ease, background 0.2s ease",
};
const ghostBtnHover = { background: "rgba(233,233,237,0.07)", transform: "scale(1.05)" };

export default function HomePage() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const isMobile = useIsMobile();
  const sidePad = isMobile ? 20 : 56;
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [navMenu, setNavMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [tab, setTab] = useState("citas");
  const [me, setMe] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const comoFunciona = t("howItWorks.steps");
  const modulos = t("modulesSection.items");
  const casos = t("useCases.tabs");
  const comoActive = useCarousel(comoFunciona.length);
  const modActive = useCarousel(modulos.length);

  useEffect(() => {
    if (!localStorage.getItem("quilt_token")) return;
    api.getCurrentCreator().then(setMe).catch(() => {
      localStorage.removeItem("quilt_token");
      clearApiCache();
      setMe(null);
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("quilt_token");
    clearApiCache();
    setMe(null);
    setProfileOpen(false);
  };

  const meInitials = me
    ? (me.display_name || me.email || "?")
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  const handlePlayerSubmit = () => {
    const slug = parseSlug(code);
    if (!slug) {
      setError(t("player.errorInvalid"));
      return;
    }
    navigate(`/play/${slug}`);
  };

  return (
    <div style={{ background: "#050505", color: "#e9e9ed", fontFamily: "Inter,system-ui,sans-serif", fontWeight: 400, minHeight: "100vh", position: "relative" }}>
      <SiteBackground />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ position: "relative" }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            {/* NAV */}
            {isMobile ? (
              <div id="top" style={{ position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)", width: "92%", maxWidth: 480, zIndex: 50 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderRadius: 16, background: "rgba(23,18,20,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,45,79,0.22)", boxShadow: "0 0 24px rgba(255,45,79,0.08)" }}>
                  <Logo />
                  <div
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#e9e9ed", flex: "none" }}
                  >
                    <i className={`fa-solid ${mobileMenuOpen ? "fa-xmark" : "fa-bars"}`} style={{ fontSize: 18 }} />
                  </div>
                </div>
                {mobileMenuOpen && (
                  <div style={{ marginTop: 8, background: "#130f11", border: "1px solid rgba(233,233,237,0.1)", borderRadius: 14, padding: 10, display: "flex", flexDirection: "column", gap: 4, boxShadow: "0 16px 40px rgba(0,0,0,0.5)", maxHeight: "70vh", overflowY: "auto" }}>
                    <DropdownItem href="#como-funciona" icon="fa-solid fa-diagram-project" title={t("nav.howItWorksTitle")} desc={t("nav.howItWorksDesc")} />
                    <DropdownItem href="#modulos" icon="fa-solid fa-shapes" title={t("nav.modulesTitle")} desc={t("nav.modulesDesc")} />
                    <DropdownItem href="#casos" icon="fa-solid fa-lightbulb" title={t("nav.useCasesTitle")} desc={t("nav.useCasesDesc")} />
                    <DropdownItem href="#jugador" icon="fa-solid fa-gamepad" title={t("nav.imPlayerTitle")} desc={t("nav.imPlayerDesc")} />
                    <div style={{ height: 1, background: "rgba(233,233,237,0.1)", margin: "6px 0" }} />
                    {me ? (
                      <>
                        <Link
                          to="/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 8, fontSize: 14, color: "#e9e9ed" }}
                        >
                          <i className="fa-solid fa-gauge" style={{ fontSize: 13, color: "rgba(233,233,237,0.6)" }} /> {t("nav.dashboard")}
                        </Link>
                        <div
                          onClick={handleLogout}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 8, fontSize: 14, color: "#ffb3c0", cursor: "pointer" }}
                        >
                          <i className="fa-solid fa-right-from-bracket" style={{ fontSize: 13 }} /> {t("nav.logout")}
                        </div>
                      </>
                    ) : (
                      <div style={{ display: "flex", gap: 8, padding: "6px 10px" }}>
                        <Link
                          to="/login"
                          onClick={() => setMobileMenuOpen(false)}
                          style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 500, color: "#e9e9ed", border: "1px solid rgba(233,233,237,0.18)", borderRadius: 7, padding: "9px 0" }}
                        >
                          {t("nav.login")}
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setMobileMenuOpen(false)}
                          style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 600, color: "#ffb3c0", background: "rgba(255,45,79,0.16)", border: "1.5px solid #ff2d4f", borderRadius: 7, padding: "8px 0" }}
                        >
                          {t("nav.createAccount")}
                        </Link>
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 6, padding: "6px 10px" }}>
                      <div
                        onClick={() => setLanguage("es")}
                        style={{ flex: 1, textAlign: "center", padding: "7px 0", borderRadius: 6, fontSize: 13, cursor: "pointer", background: language === "es" ? "rgba(255,45,79,0.16)" : "rgba(255,255,255,0.04)", color: language === "es" ? "#ffb3c0" : "#e9e9ed" }}
                      >
                        ES
                      </div>
                      <div
                        onClick={() => setLanguage("en")}
                        style={{ flex: 1, textAlign: "center", padding: "7px 0", borderRadius: 6, fontSize: 13, cursor: "pointer", background: language === "en" ? "rgba(255,45,79,0.16)" : "rgba(255,255,255,0.04)", color: language === "en" ? "#ffb3c0" : "#e9e9ed" }}
                      >
                        EN
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
            <div
              id="top"
              style={{
                position: "fixed",
                top: 12,
                left: "50%",
                transform: "translateX(-50%)",
                width: "90%",
                maxWidth: 1600,
                zIndex: 50,
                display: "flex",
                alignItems: "center",
                gap: 28,
                padding: "10px 24px",
                borderRadius: 16,
                background: "rgba(23,18,20,0.75)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,45,79,0.22)",
                boxShadow: "0 0 24px rgba(255,45,79,0.08)",
              }}
            >
              <Logo style={{ marginRight: "auto" }} />

              <NavDropdown
                label={t("nav.functions")}
                icon="fa-solid fa-wand-magic-sparkles"
                open={navMenu === "producto"}
                onEnter={() => setNavMenu("producto")}
                onLeave={() => setNavMenu(null)}
              >
                <DropdownItem href="#como-funciona" icon="fa-solid fa-diagram-project" title={t("nav.howItWorksTitle")} desc={t("nav.howItWorksDesc")} />
                <DropdownItem href="#modulos" icon="fa-solid fa-shapes" title={t("nav.modulesTitle")} desc={t("nav.modulesDesc")} />
              </NavDropdown>

              <NavDropdown
                label={t("nav.resources")}
                icon="fa-solid fa-book-open"
                open={navMenu === "recursos"}
                onEnter={() => setNavMenu("recursos")}
                onLeave={() => setNavMenu(null)}
              >
                <DropdownItem href="#casos" icon="fa-solid fa-lightbulb" title={t("nav.useCasesTitle")} desc={t("nav.useCasesDesc")} />
                <DropdownItem href="#jugador" icon="fa-solid fa-gamepad" title={t("nav.imPlayerTitle")} desc={t("nav.imPlayerDesc")} />
              </NavDropdown>

              {me ? (
                <div style={{ position: "relative" }}>
                  <div
                    onClick={() => setProfileOpen(!profileOpen)}
                    style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "4px 10px 4px 4px", borderRadius: 20, border: "1px solid rgba(233,233,237,0.16)" }}
                  >
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,45,79,0.22)", color: "#ffb3c0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>
                      {meInitials}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{me.display_name || me.email}</span>
                    <i className="fa-solid fa-chevron-down" style={{ fontSize: 9, color: "rgba(233,233,237,0.55)" }} />
                  </div>
                  {profileOpen && (
                    <div style={{ position: "absolute", top: 42, right: 0, background: "#171217", border: "1px solid rgba(233,233,237,0.12)", borderRadius: 10, padding: 6, display: "flex", flexDirection: "column", gap: 2, minWidth: 170, boxShadow: "0 12px 32px rgba(0,0,0,0.5)" }}>
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, fontSize: 13, color: "#e9e9ed" }}
                      >
                        <i className="fa-solid fa-gauge" style={{ fontSize: 12, color: "rgba(233,233,237,0.6)" }} /> {t("nav.dashboard")}
                      </Link>
                      <div
                        onClick={handleLogout}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, fontSize: 13, color: "#ffb3c0", cursor: "pointer" }}
                      >
                        <i className="fa-solid fa-right-from-bracket" style={{ fontSize: 12 }} /> {t("nav.logout")}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <HoverLink
                    to="/login"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 13, color: "#e9e9ed", border: "1px solid rgba(233,233,237,0.18)", borderRadius: 7, padding: "7px 12px", transition: "transform 0.2s ease, background 0.2s ease" }}
                    hoverStyle={{ background: "rgba(233,233,237,0.09)", transform: "scale(1.05)" }}
                  >
                    {t("nav.login")}
                  </HoverLink>
                  <HoverLink
                    to="/register"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 13, color: "#ffb3c0", background: "rgba(255,45,79,0.16)", border: "1.5px solid #ff2d4f", borderRadius: 7, padding: "7px 13px", boxShadow: "0 0 16px rgba(255,45,79,0.3)", transition: "transform 0.2s ease, background 0.2s ease" }}
                    hoverStyle={{ background: "rgba(255,45,79,0.3)", transform: "scale(1.07)" }}
                  >
                    {t("nav.createAccount")}
                  </HoverLink>
                </div>
              )}

              <div style={{ position: "relative" }}>
                <div
                  onClick={() => setLangOpen(!langOpen)}
                  style={{ height: 34, padding: "0 10px", borderRadius: 8, border: "1px solid rgba(233,233,237,0.16)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 13 }}
                >
                  <span>{language.toUpperCase()}</span>
                  <i className="fa-solid fa-chevron-down" style={{ fontSize: 9, color: "rgba(233,233,237,0.55)" }} />
                </div>
                {langOpen && (
                  <div style={{ position: "absolute", top: 42, right: 0, background: "#171217", border: "1px solid rgba(233,233,237,0.12)", borderRadius: 10, padding: 6, display: "flex", flexDirection: "column", gap: 2, minWidth: 88, boxShadow: "0 12px 32px rgba(0,0,0,0.5)" }}>
                    <div
                      onClick={() => {
                        setLanguage("es");
                        setLangOpen(false);
                      }}
                      style={{ padding: "7px 10px", borderRadius: 6, fontSize: 13, cursor: "pointer", background: language === "es" ? "rgba(255,45,79,0.16)" : "transparent", color: language === "es" ? "#ffb3c0" : "#e9e9ed" }}
                    >
                      ES · Español
                    </div>
                    <div
                      onClick={() => {
                        setLanguage("en");
                        setLangOpen(false);
                      }}
                      style={{ padding: "7px 10px", borderRadius: 6, fontSize: 13, cursor: "pointer", background: language === "en" ? "rgba(255,45,79,0.16)" : "transparent", color: language === "en" ? "#ffb3c0" : "#e9e9ed" }}
                    >
                      EN · English
                    </div>
                  </div>
                )}
              </div>
            </div>
            )}

            {/* HERO */}
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "96px 20px 48px" : "112px 56px 88px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.05fr 0.95fr", gap: isMobile ? 40 : 64, alignItems: "center" }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 12, padding: "6px 16px 6px 10px", borderRadius: 20, border: "1px solid rgba(255,45,79,0.35)", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(10px)", color: "#ffb3c0", marginBottom: 22 }}>
                  <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 11, color: "#ff2d4f" }} />
                  <span style={{ fontWeight: 600, color: "#ffb3c0" }}>{t("hero.badge1")}</span>
                  <span style={{ width: 1, height: 14, background: "rgba(233,233,237,0.2)" }} />
                  <span style={{ color: "rgba(233,233,237,0.6)" }}>{t("hero.badge2")}</span>
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: 10, color: "rgba(233,233,237,0.5)" }} />
                </div>
                <h1 style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: isMobile ? 36 : 58, lineHeight: 1.05, letterSpacing: "-0.02em", margin: "0 0 18px", maxWidth: isMobile ? "14ch" : "10.5ch" }}>
                  {t("hero.titleLine1")}{" "}
                  <span style={{ color: "#ff2d4f", textShadow: "0 0 30px rgba(255,45,79,0.5)" }}>{t("hero.titleHighlight")}</span>
                </h1>
                <p style={{ fontSize: 16, lineHeight: 1.6, opacity: 0.8, margin: "0 0 32px", maxWidth: "46ch" }}>{t("hero.subcopy")}</p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <HoverLink to="/register" style={primaryBtn} hoverStyle={primaryBtnHover}>
                    {t("hero.ctaPrimary")}
                  </HoverLink>
                  <HoverAnchor href="#como-funciona" style={ghostBtn} hoverStyle={ghostBtnHover}>
                    {t("hero.ctaSecondary")}
                  </HoverAnchor>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ width: 280, maxWidth: "100%", borderRadius: 32, background: "#171217", boxShadow: "0 0 0 1px rgba(233,233,237,0.09), 0 0 60px rgba(255,45,79,0.22), 0 6px 18px rgba(0,0,0,0.55)", padding: "20px 18px 28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22 }}>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(233,233,237,0.14)", overflow: "hidden" }}>
                      <div style={{ width: "64%", height: "100%", background: "#ff2d4f" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#ffb3c0", fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500 }}>32 pts</div>
                  </div>
                  <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(233,233,237,0.55)", marginBottom: 8 }}>{t("hero.mockupProgress")}</div>
                  <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 19, lineHeight: 1.25, marginBottom: 22 }}>{t("hero.mockupQuestion")}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ border: "1px solid #ff2d4f", borderRadius: 8, padding: "12px 14px", fontSize: 14, color: "#ffb3c0" }}>{t("hero.mockupOption1")}</div>
                    <div style={{ border: "1px solid rgba(233,233,237,0.16)", borderRadius: 8, padding: "12px 14px", fontSize: 14 }}>{t("hero.mockupOption2")}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* BUILT WITH */}
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: `0 ${sidePad}px 64px`, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 13, color: "rgba(233,233,237,0.55)" }}>{t("builtWith")}</div>
              <div style={{ display: "flex", gap: 26, flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
                {BUILT_WITH.map((b) => (
                  <i key={b.title} className={b.icon} title={b.title} style={{ fontSize: 24, color: "rgba(233,233,237,0.82)" }} />
                ))}
              </div>
            </div>

            {/* PLAYER CODE ENTRY */}
            <div id="jugador" style={{ maxWidth: 1280, margin: "0 auto", padding: `0 ${sidePad}px 64px` }}>
              <div style={{ ...ACRYLIC_PANEL, borderRadius: 14, padding: 32, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#ff2d4f", marginBottom: 6 }}>{t("player.badge")}</div>
                  <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 20, marginBottom: 6 }}>{t("player.title")}</div>
                  <p style={{ fontSize: 13, opacity: 0.7, margin: 0 }}>{t("player.subtitle")}</p>
                  {error && <p style={{ fontSize: 12, color: "#ff2d4f", marginTop: 8 }}>{error}</p>}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePlayerSubmit()}
                    placeholder={t("player.placeholder")}
                    style={{ width: 180, height: 44, padding: "0 14px", borderRadius: 8, background: "#171217", border: "1px solid rgba(233,233,237,0.16)", color: "#e9e9ed", fontSize: 14, fontFamily: "Inter,system-ui,sans-serif", letterSpacing: "0.05em" }}
                  />
                  <HoverAnchor
                    href="#jugador"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePlayerSubmit();
                    }}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 14, color: "#ffb3c0", background: "rgba(255,45,79,0.16)", border: "1.5px solid #ff2d4f", borderRadius: 8, padding: "12px 22px", boxShadow: "0 0 20px rgba(255,45,79,0.3)", transition: "transform 0.2s ease, background 0.2s ease" }}
                    hoverStyle={{ background: "rgba(255,45,79,0.3)", transform: "scale(1.07)" }}
                  >
                    {t("player.cta")}
                  </HoverAnchor>
                </div>
              </div>
            </div>

            {/* COMO FUNCIONA */}
            <div id="como-funciona" style={{ maxWidth: 1280, margin: "0 auto", padding: `64px ${sidePad}px` }}>
              <h6 style={{ fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "#ff2d4f", margin: "0 0 8px" }}>{t("howItWorks.eyebrow")}</h6>
              <h2 style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 32, margin: "0 0 40px", maxWidth: "20ch" }}>{t("howItWorks.title")}</h2>
              <div style={{ position: "relative", height: 210 }}>
                {comoFunciona.map((item, i) => {
                  const activeSlot = (i - comoActive + comoFunciona.length) % comoFunciona.length === 0;
                  return (
                    <div key={item.title} style={slotStyle(i, comoActive, comoFunciona.length, 12)}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: activeSlot ? "rgba(255,45,79,0.22)" : "rgba(255,45,79,0.14)", border: `1px solid ${activeSlot ? "rgba(255,45,79,0.4)" : "rgba(255,45,79,0.25)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className={item.icon} style={{ fontSize: 16, color: "#ff2d4f" }} />
                      </div>
                      <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 17 }}>{item.title}</div>
                      <p style={{ fontSize: 13, opacity: activeSlot ? 0.75 : 0.7, margin: 0 }}>{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MODULOS */}
            <div id="modulos" style={{ maxWidth: 1280, margin: "0 auto", padding: `64px ${sidePad}px` }}>
              <h6 style={{ fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "#ff2d4f", margin: "0 0 8px" }}>{t("modulesSection.eyebrow")}</h6>
              <h2 style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 32, margin: "0 0 40px", maxWidth: "24ch" }}>{t("modulesSection.title")}</h2>
              <div style={{ position: "relative", height: 250 }}>
                {modulos.map((item, i) => {
                  const activeSlot = (i - modActive + modulos.length) % modulos.length === 0;
                  return (
                    <div key={item.title} style={slotStyle(i, modActive, modulos.length, 14)}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: activeSlot ? "rgba(255,45,79,0.22)" : "rgba(255,45,79,0.14)", border: `1px solid ${activeSlot ? "rgba(255,45,79,0.4)" : "rgba(255,45,79,0.25)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className={item.icon} style={{ fontSize: 16, color: "#ff2d4f" }} />
                      </div>
                      <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 17 }}>{item.title}</div>
                      <p style={{ fontSize: 13, opacity: activeSlot ? 0.75 : 0.7, margin: 0, flex: 1 }}>{item.desc}</p>
                      <div style={{ display: "inline-flex", alignSelf: "flex-start", fontSize: 11, padding: "3px 10px", borderRadius: 6, background: activeSlot ? "rgba(255,45,79,0.22)" : "#5c1424", color: "#fff0f2" }}>{item.pts}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BUILDER MOCKUP */}
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: `64px ${sidePad}px` }}>
              <h6 style={{ fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "#ff2d4f", margin: "0 0 8px" }}>{t("builder.eyebrow")}</h6>
              <h2 style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 32, margin: "0 0 12px", maxWidth: "22ch" }}>{t("builder.title")}</h2>
              <p style={{ fontSize: 14, opacity: 0.8, margin: "0 0 40px", maxWidth: "52ch" }}>{t("builder.copy")}</p>

              <div style={{ ...ACRYLIC_PANEL, borderRadius: 14, boxShadow: "0 6px 18px rgba(0,0,0,0.55)", overflow: "hidden" }}>
                <BrowserChrome label={t("builder.browserLabel")} />
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.3fr 1fr" }}>
                  <div style={{ padding: 24, borderRight: "1px solid rgba(233,233,237,0.16)" }}>
                    <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(233,233,237,0.55)", marginBottom: 14 }}>{t("builder.modulesLabel")}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {t("builder.rows").map((row, i) => (
                        <div key={row.text} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 8, background: "#1f151a" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" stroke="rgba(233,233,237,0.4)" strokeWidth="2" strokeLinecap="round" fill="none">
                            <line x1="4" y1="8" x2="20" y2="8"></line>
                            <line x1="4" y1="16" x2="20" y2="16"></line>
                          </svg>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: ["#ff7d93", "#d81f3f", "#5c1424"][i % 3] }} />
                          <div style={{ flex: 1, fontSize: 14 }}>{row.text}</div>
                          <div style={{ fontSize: 11, color: "rgba(233,233,237,0.55)" }}>{row.pts}</div>
                        </div>
                      ))}
                      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 8, background: "#1f151a", opacity: 0.55 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" stroke="rgba(233,233,237,0.4)" strokeWidth="2" strokeLinecap="round" fill="none">
                          <line x1="4" y1="8" x2="20" y2="8"></line>
                          <line x1="4" y1="16" x2="20" y2="16"></line>
                        </svg>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff7d93" }} />
                        <div style={{ flex: 1, fontSize: 14 }}>{t("builder.addModule")}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: 24 }}>
                    <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(233,233,237,0.55)", marginBottom: 14 }}>{t("builder.rewardsLabel")}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 8, border: "1px solid rgba(233,233,237,0.16)" }}>
                        <div>
                          <div style={{ fontSize: 14 }}>{t("builder.reward1Title")}</div>
                          <div style={{ fontSize: 11, color: "rgba(233,233,237,0.55)", marginTop: 2 }}>{t("builder.reward1Sub")}</div>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" stroke="#ff2d4f" strokeWidth="1.6" fill="none">
                          <rect x="3" y="5" width="18" height="16" rx="2"></rect>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                          <line x1="8" y1="3" x2="8" y2="7"></line>
                          <line x1="16" y1="3" x2="16" y2="7"></line>
                        </svg>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 8, border: "1px solid #ff2d4f" }}>
                        <div>
                          <div style={{ fontSize: 14 }}>{t("builder.reward2Title")}</div>
                          <div style={{ fontSize: 11, color: "#ffb3c0", marginTop: 2 }}>{t("builder.reward2Sub")}</div>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" stroke="#ff2d4f" strokeWidth="1.6" fill="none">
                          <rect x="3" y="5" width="18" height="16" rx="2"></rect>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                          <line x1="8" y1="3" x2="8" y2="7"></line>
                          <line x1="16" y1="3" x2="16" y2="7"></line>
                        </svg>
                      </div>
                    </div>
                    <a href="#" style={{ display: "inline-flex", marginTop: 20, alignItems: "center", gap: 6, fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 13, color: "#ff2d4f", border: "1px solid #ff2d4f", borderRadius: 8, padding: "9px 16px" }}>
                      {t("builder.previewCta")}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* DASHBOARD */}
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: `64px ${sidePad}px` }}>
              <h6 style={{ fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "#ff2d4f", margin: "0 0 8px" }}>{t("dashboardMockup.eyebrow")}</h6>
              <h2 style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 32, margin: "0 0 12px", maxWidth: "24ch" }}>{t("dashboardMockup.title")}</h2>
              <p style={{ fontSize: 14, opacity: 0.8, margin: "0 0 40px", maxWidth: "52ch" }}>{t("dashboardMockup.copy")}</p>

              <div style={{ ...ACRYLIC_PANEL, borderRadius: 14, boxShadow: "0 6px 18px rgba(0,0,0,0.55)", overflow: "hidden" }}>
                <BrowserChrome label={t("dashboardMockup.browserLabel")} />
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.2fr" }}>
                  <div style={{ padding: 24, borderRight: "1px solid rgba(233,233,237,0.16)" }}>
                    <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(233,233,237,0.55)", marginBottom: 14 }}>{t("dashboardMockup.experiencesLabel")}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 8, border: "1px solid #ff2d4f", background: "#1f151a" }}>
                        <div>
                          <div style={{ fontSize: 14 }}>{t("dashboardMockup.exp1")}</div>
                          <div style={{ fontSize: 11, color: "rgba(233,233,237,0.55)", marginTop: 2 }}>{t("dashboardMockup.exp1Sub")}</div>
                        </div>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff2d4f", boxShadow: "0 0 8px #ff2d4f" }} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 8, background: "#1f151a" }}>
                        <div>
                          <div style={{ fontSize: 14 }}>{t("dashboardMockup.exp2")}</div>
                          <div style={{ fontSize: 11, color: "rgba(233,233,237,0.55)", marginTop: 2 }}>{t("dashboardMockup.exp2Sub")}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderRadius: 8, background: "#1f151a", opacity: 0.55 }}>
                        <div style={{ fontSize: 14 }}>{t("dashboardMockup.newExperience")}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: 24 }}>
                    <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(233,233,237,0.55)", marginBottom: 14 }}>{t("dashboardMockup.answersLabel")}</div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {[
                        { i: "MJ", bg: "rgba(255,45,79,0.18)", color: "#ffb3c0", name: "María J.", pts: "52 pts", reward: t("builder.reward2Title"), border: true },
                        { i: "LT", bg: "rgba(79,180,255,0.18)", color: "#a8d8ff", name: "Lucas T.", pts: "38 pts", reward: t("builder.reward1Title"), border: true },
                        { i: "SP", bg: "rgba(255,190,60,0.18)", color: "#ffe0a3", name: "Sofía P.", pts: "45 pts", reward: t("builder.reward2Title"), border: false },
                      ].map((row) => (
                        <div key={row.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 4px", borderBottom: row.border ? "1px solid rgba(233,233,237,0.1)" : "none" }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: row.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: row.color, flex: "none" }}>{row.i}</div>
                          <div style={{ flex: 1, fontSize: 13 }}>{row.name}</div>
                          <div style={{ fontSize: 12, color: "rgba(233,233,237,0.55)" }}>{row.pts}</div>
                          <div style={{ fontSize: 12, color: "#ffb3c0" }}>{row.reward}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PLAYER JOURNEY */}
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: `64px ${sidePad}px` }}>
              <h6 style={{ fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "#ff2d4f", margin: "0 0 8px" }}>{t("journey.eyebrow")}</h6>
              <h2 style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 32, margin: "0 0 40px", maxWidth: "22ch" }}>{t("journey.title")}</h2>
              <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center" }}>
                <div style={{ width: 220 }}>
                  <div style={{ ...ACRYLIC_PANEL, borderRadius: 24, padding: "20px 16px", height: 340, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", justifyContent: "center", gap: 12 }}>
                    <img src={logoMark} alt="Quilt" style={{ width: 40, height: 40, borderRadius: 10, display: "block" }} />
                    <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 16 }}>{t("journey.step1Title")}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{t("journey.step1Sub")}</div>
                    <div style={{ marginTop: 6, fontSize: 13, color: "#ff2d4f", border: "1px solid #ff2d4f", borderRadius: 8, padding: "8px 18px" }}>{t("journey.step1Cta")}</div>
                  </div>
                  <div style={{ textAlign: "center", fontSize: 12, opacity: 0.6, marginTop: 10 }}>{t("journey.step1Label")}</div>
                </div>

                <div style={{ width: 220 }}>
                  <div style={{ ...ACRYLIC_PANEL, borderRadius: 24, padding: "20px 16px", height: 340, display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(233,233,237,0.14)", overflow: "hidden" }}>
                        <div style={{ width: "40%", height: "100%", background: "#ff2d4f" }} />
                      </div>
                      <div style={{ fontSize: 10, color: "#ffb3c0" }}>{t("journey.step2Points")}</div>
                    </div>
                    <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 15 }}>{t("journey.step2Question")}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ fontSize: 12, border: "1px solid #ff2d4f", color: "#ffb3c0", borderRadius: 7, padding: "9px 10px" }}>{t("journey.step2Option1")}</div>
                      <div style={{ fontSize: 12, border: "1px solid rgba(233,233,237,0.16)", borderRadius: 7, padding: "9px 10px" }}>{t("journey.step2Option2")}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", fontSize: 12, opacity: 0.6, marginTop: 10 }}>{t("journey.step2Label")}</div>
                </div>

                <div style={{ width: 220 }}>
                  <div style={{ ...ACRYLIC_PANEL, borderRadius: 24, padding: "20px 16px", height: 340, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 15 }}>{t("journey.step3Title")}</div>
                    <div style={{ fontSize: 10, opacity: 0.6 }}>{t("journey.step3Sub")}</div>
                    <div style={{ border: "1px solid #ff2d4f", borderRadius: 7, padding: 10, fontSize: 12, color: "#ffb3c0" }}>{t("journey.step3Option1")}</div>
                    <div style={{ border: "1px solid rgba(233,233,237,0.16)", borderRadius: 7, padding: 10, fontSize: 12 }}>{t("journey.step3Option2")}</div>
                    <div style={{ marginTop: "auto" }}>
                      <div style={{ fontSize: 10, opacity: 0.6, marginBottom: 6 }}>{t("journey.step3DateLabel")}</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <div style={{ flex: 1, fontSize: 11, background: "#1f151a", borderRadius: 6, padding: 7 }}>{t("journey.step3Date")}</div>
                        <div style={{ flex: 1, fontSize: 11, background: "#1f151a", borderRadius: 6, padding: 7 }}>{t("journey.step3Time")}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", fontSize: 12, opacity: 0.6, marginTop: 10 }}>{t("journey.step3Label")}</div>
                </div>

                <div style={{ width: 220 }}>
                  <div style={{ ...ACRYLIC_PANEL, borderRadius: 24, padding: "20px 16px", height: 340, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", justifyContent: "center", gap: 12 }}>
                    <i className="fa-solid fa-circle-check" style={{ fontSize: 34, color: "#ff2d4f" }} />
                    <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 16 }}>{t("journey.step4Title")}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{t("journey.step4Sub")}</div>
                    <div style={{ fontSize: 11, background: "#1f151a", borderRadius: 7, padding: "8px 12px", marginTop: 6 }}>{t("journey.step4Summary")}</div>
                  </div>
                  <div style={{ textAlign: "center", fontSize: 12, opacity: 0.6, marginTop: 10 }}>{t("journey.step4Label")}</div>
                </div>
              </div>
            </div>

            {/* CASOS DE USO */}
            <div id="casos" style={{ maxWidth: 1280, margin: "0 auto", padding: `64px ${sidePad}px` }}>
              <h6 style={{ fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "#ff2d4f", margin: "0 0 8px" }}>{t("useCases.eyebrow")}</h6>
              <h2 style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 32, margin: "0 0 32px", maxWidth: "22ch" }}>{t("useCases.title")}</h2>

              <div style={{ display: "inline-flex", border: "1px solid rgba(233,233,237,0.16)", borderRadius: 8, overflow: "hidden", marginBottom: 28 }}>
                {Object.entries(casos).map(([key, val], i) => (
                  <div
                    key={key}
                    onClick={() => setTab(key)}
                    style={{
                      padding: "9px 18px",
                      fontSize: 13,
                      cursor: "pointer",
                      borderLeft: i > 0 ? "1px solid rgba(233,233,237,0.16)" : "none",
                      background: tab === key ? "#5c1424" : "transparent",
                      color: tab === key ? "#fff0f2" : "rgba(233,233,237,0.7)",
                    }}
                  >
                    {val.label}
                  </div>
                ))}
              </div>

              <div style={{ ...ACRYLIC_PANEL, padding: 28, borderRadius: 14, maxWidth: "60ch" }}>
                <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0 }}>{casos[tab].copy}</p>
              </div>
            </div>
          </div>
        </div>

        {/* BACK TO TOP */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: `20px ${sidePad}px 72px`, textAlign: "center" }}>
          <h2 style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 26, margin: "0 0 8px" }}>{t("backToTop.title")}</h2>
          <p style={{ fontSize: 14, color: "rgba(233,233,237,0.65)", margin: "0 0 24px" }}>{t("backToTop.subtitle")}</p>
          <HoverLink
            to="/register"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 14, color: "#ffb3c0", background: "rgba(255,45,79,0.16)", border: "1.5px solid #ff2d4f", borderRadius: 8, padding: "12px 24px", boxShadow: "0 0 24px rgba(255,45,79,0.4)", transition: "transform 0.2s ease, background 0.2s ease" }}
            hoverStyle={{ background: "rgba(255,45,79,0.32)", transform: "scale(1.06)" }}
          >
            {t("backToTop.cta")}
          </HoverLink>
          <div style={{ marginTop: 48 }}>
            <HoverAnchor
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(233,233,237,0.6)" }}
              hoverStyle={{ color: "#e9e9ed" }}
            >
              <i className="fa-solid fa-arrow-up" /> {t("backToTop.backLink")}
            </HoverAnchor>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: `0 ${sidePad}px 40px` }}>
          <div style={{ height: 1, background: "rgba(233,233,237,0.1)", marginBottom: 24 }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 15 }}>Quilt</div>
              <div style={{ fontSize: 12, opacity: 0.55 }}>{t("footer.tagline")}</div>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <Link to="/login" style={{ fontSize: 13, color: "#e9e9ed" }}>
                {t("nav.login")}
              </Link>
              <Link to="/register" style={{ fontSize: 13, color: "#ff2d4f" }}>
                {t("nav.createAccount")}
              </Link>
            </div>
            <div style={{ fontSize: 12, opacity: 0.55 }}>{t("footer.copyright")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
