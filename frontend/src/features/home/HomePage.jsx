import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoMark from "../../assets/quilt-logo-mark.png";
import { api } from "../../api/client";
import Logo from "../../components/Logo";
import SiteBackground from "../../components/SiteBackground";

function parseSlug(input) {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const withoutQuery = trimmed.split("?")[0].split("#")[0];
  const segments = withoutQuery.split("/").filter(Boolean);
  return segments[segments.length - 1];
}

const HERO_SUBCOPY =
  "Preguntas, minijuegos y recompensas combinados como una colcha — a tu manera. Creás tu cuenta, armás la experiencia, y quien juega entra con un link sin registrarse.";

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

const COMO_FUNCIONA = [
  {
    icon: "fa-solid fa-layer-group",
    title: "Diseñá tus módulos",
    desc: "Elegís entre preguntas de opción múltiple, respuesta libre o subida de foto, y le asignás puntos a cada una.",
  },
  {
    icon: "fa-solid fa-gift",
    title: "Definí las recompensas",
    desc: "Configurás qué se desbloquea según el puntaje acumulado, con fecha y hora si hace falta coordinar.",
  },
  {
    icon: "fa-solid fa-link",
    title: "Compartí el link",
    desc: "Cualquiera entra, juega y elige su recompensa al final. Sin cuenta, sin fricción.",
  },
];

const MODULOS = [
  {
    icon: "fa-solid fa-list-check",
    title: "Opción múltiple",
    desc: "Preguntas con respuestas predefinidas. Cada opción puede otorgar los mismos puntos, sin importar cuál se elija.",
    pts: "+10 pts",
  },
  {
    icon: "fa-solid fa-align-left",
    title: "Respuesta de texto",
    desc: "Espacio abierto para que el jugador escriba lo que quiera. Ideal para respuestas personales o creativas.",
    pts: "+15 pts",
  },
  {
    icon: "fa-solid fa-camera",
    title: "Subir una foto",
    desc: "El jugador sube una imagen desde su dispositivo — una foto de su mascota, de dónde está, de lo que sea.",
    pts: "+20 pts",
  },
];

const CASOS = {
  citas: {
    label: "Cita personalizada",
    copy: "Armá preguntas sobre gustos y recuerdos, sumá puntos sin importar la respuesta, y dejá que tu pareja elija el plan — con fecha y hora incluidas si hace falta coordinar.",
  },
  equipo: {
    label: "Dinámica de equipo",
    copy: "Usalo como rompehielos o cierre de reunión: preguntas rápidas, algún minijuego, y una recompensa simbólica al final para todo el equipo.",
  },
  encuesta: {
    label: "Encuesta rápida",
    copy: "Reemplazá el formulario aburrido por una secuencia con puntos y un pequeño premio al final — mejora la tasa de respuesta sin pedirle nada a nadie.",
  },
};

function useCarousel(length, intervalMs = 3200) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % length), intervalMs);
    return () => clearInterval(id);
  }, [length, intervalMs]);
  return active;
}

const ACRYLIC_PANEL = {
  background: "rgba(255,255,255,0.22)",
  backdropFilter: "blur(28px) saturate(160%)",
  WebkitBackdropFilter: "blur(28px) saturate(160%)",
  border: "1px solid rgba(255,255,255,0.34)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
};

function slotStyle(index, active, length, gap) {
  const slot = (index - active + length) % length;
  const base = {
    position: "absolute",
    top: 0,
    width: "31%",
    padding: 24,
    borderRadius: 12,
    backdropFilter: "blur(18px) saturate(160%)",
    WebkitBackdropFilter: "blur(18px) saturate(160%)",
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
      background: "rgba(255,255,255,0.26)",
      border: "1px solid #ff2d4f",
      boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 0 32px rgba(255,45,79,0.25)",
      transform: "scale(1.05)",
      zIndex: 3,
    };
  }
  return {
    ...base,
    left: slot === 1 ? "68%" : "0%",
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.3)",
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
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [navMenu, setNavMenu] = useState(null);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState("ES");
  const [tab, setTab] = useState("citas");
  const [me, setMe] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const comoActive = useCarousel(COMO_FUNCIONA.length);
  const modActive = useCarousel(MODULOS.length);

  useEffect(() => {
    if (!localStorage.getItem("quilt_token")) return;
    api.getCurrentCreator().then(setMe).catch(() => {
      localStorage.removeItem("quilt_token");
      setMe(null);
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("quilt_token");
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
      setError("Ingresá un código o un enlace válido");
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
                label="Funciones"
                icon="fa-solid fa-wand-magic-sparkles"
                open={navMenu === "producto"}
                onEnter={() => setNavMenu("producto")}
                onLeave={() => setNavMenu(null)}
              >
                <DropdownItem href="#como-funciona" icon="fa-solid fa-diagram-project" title="Cómo funciona" desc="Tres pasos para armar tu experiencia." />
                <DropdownItem href="#modulos" icon="fa-solid fa-shapes" title="Módulos" desc="Preguntas, texto libre y subida de fotos." />
              </NavDropdown>

              <NavDropdown
                label="Recursos"
                icon="fa-solid fa-book-open"
                open={navMenu === "recursos"}
                onEnter={() => setNavMenu("recursos")}
                onLeave={() => setNavMenu(null)}
              >
                <DropdownItem href="#casos" icon="fa-solid fa-lightbulb" title="Casos de uso" desc="Citas, equipos y encuestas rápidas." />
                <DropdownItem href="#jugador" icon="fa-solid fa-gamepad" title="Soy jugador" desc="Entrá con un código, sin cuenta." />
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
                        <i className="fa-solid fa-gauge" style={{ fontSize: 12, color: "rgba(233,233,237,0.6)" }} /> Panel de control
                      </Link>
                      <div
                        onClick={handleLogout}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, fontSize: 13, color: "#ffb3c0", cursor: "pointer" }}
                      >
                        <i className="fa-solid fa-right-from-bracket" style={{ fontSize: 12 }} /> Cerrar sesión
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
                    Iniciar sesión
                  </HoverLink>
                  <HoverLink
                    to="/register"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 13, color: "#ffb3c0", background: "rgba(255,45,79,0.16)", border: "1.5px solid #ff2d4f", borderRadius: 7, padding: "7px 13px", boxShadow: "0 0 16px rgba(255,45,79,0.3)", transition: "transform 0.2s ease, background 0.2s ease" }}
                    hoverStyle={{ background: "rgba(255,45,79,0.3)", transform: "scale(1.07)" }}
                  >
                    Crear cuenta
                  </HoverLink>
                </div>
              )}

              <div style={{ position: "relative" }}>
                <div
                  onClick={() => setLangOpen(!langOpen)}
                  style={{ height: 34, padding: "0 10px", borderRadius: 8, border: "1px solid rgba(233,233,237,0.16)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 13 }}
                >
                  <span>{lang}</span>
                  <i className="fa-solid fa-chevron-down" style={{ fontSize: 9, color: "rgba(233,233,237,0.55)" }} />
                </div>
                {langOpen && (
                  <div style={{ position: "absolute", top: 42, right: 0, background: "#171217", border: "1px solid rgba(233,233,237,0.12)", borderRadius: 10, padding: 6, display: "flex", flexDirection: "column", gap: 2, minWidth: 88, boxShadow: "0 12px 32px rgba(0,0,0,0.5)" }}>
                    <div
                      onClick={() => {
                        setLang("ES");
                        setLangOpen(false);
                      }}
                      style={{ padding: "7px 10px", borderRadius: 6, fontSize: 13, cursor: "pointer", background: lang === "ES" ? "rgba(255,45,79,0.16)" : "transparent", color: lang === "ES" ? "#ffb3c0" : "#e9e9ed" }}
                    >
                      ES · Español
                    </div>
                    <div
                      onClick={() => {
                        setLang("EN");
                        setLangOpen(false);
                      }}
                      style={{ padding: "7px 10px", borderRadius: 6, fontSize: 13, cursor: "pointer", background: lang === "EN" ? "rgba(255,45,79,0.16)" : "transparent", color: lang === "EN" ? "#ffb3c0" : "#e9e9ed" }}
                    >
                      EN · English
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* HERO */}
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "112px 56px 88px", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 64, alignItems: "center" }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 12, padding: "6px 16px 6px 10px", borderRadius: 20, border: "1px solid rgba(255,45,79,0.35)", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(10px)", color: "#ffb3c0", marginBottom: 22 }}>
                  <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 11, color: "#ff2d4f" }} />
                  <span style={{ fontWeight: 600, color: "#ffb3c0" }}>Constructor de experiencias interactivas</span>
                  <span style={{ width: 1, height: 14, background: "rgba(233,233,237,0.2)" }} />
                  <span style={{ color: "rgba(233,233,237,0.6)" }}>Preguntas, minijuegos y recompensas</span>
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: 10, color: "rgba(233,233,237,0.5)" }} />
                </div>
                <h1 style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 58, lineHeight: 1.05, letterSpacing: "-0.02em", margin: "0 0 18px", maxWidth: "10.5ch" }}>
                  Armá una experiencia,{" "}
                  <span style={{ color: "#ff2d4f", textShadow: "0 0 30px rgba(255,45,79,0.5)" }}>pieza por pieza.</span>
                </h1>
                <p style={{ fontSize: 16, lineHeight: 1.6, opacity: 0.8, margin: "0 0 32px", maxWidth: "46ch" }}>{HERO_SUBCOPY}</p>
                <div style={{ display: "flex", gap: 12 }}>
                  <HoverLink to="/register" style={primaryBtn} hoverStyle={primaryBtnHover}>
                    Crear cuenta gratis
                  </HoverLink>
                  <HoverAnchor href="#como-funciona" style={ghostBtn} hoverStyle={ghostBtnHover}>
                    Ver cómo funciona
                  </HoverAnchor>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ width: 280, borderRadius: 32, background: "#171217", boxShadow: "0 0 0 1px rgba(233,233,237,0.09), 0 0 60px rgba(255,45,79,0.22), 0 6px 18px rgba(0,0,0,0.55)", padding: "20px 18px 28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22 }}>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(233,233,237,0.14)", overflow: "hidden" }}>
                      <div style={{ width: "64%", height: "100%", background: "#ff2d4f" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#ffb3c0", fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500 }}>32 pts</div>
                  </div>
                  <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(233,233,237,0.55)", marginBottom: 8 }}>Pregunta 3 de 7</div>
                  <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 19, lineHeight: 1.25, marginBottom: 22 }}>¿Playa o montaña para el próximo finde?</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ border: "1px solid #ff2d4f", borderRadius: 8, padding: "12px 14px", fontSize: 14, color: "#ffb3c0" }}>Playa, sin dudarlo</div>
                    <div style={{ border: "1px solid rgba(233,233,237,0.16)", borderRadius: 8, padding: "12px 14px", fontSize: 14 }}>Montaña, prefiero el fresco</div>
                  </div>
                </div>
              </div>
            </div>

            {/* BUILT WITH */}
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 56px 64px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 13, color: "rgba(233,233,237,0.55)" }}>Construido con</div>
              <div style={{ display: "flex", gap: 26, flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
                {BUILT_WITH.map((b) => (
                  <i key={b.title} className={b.icon} title={b.title} style={{ fontSize: 24, color: "rgba(233,233,237,0.82)" }} />
                ))}
              </div>
            </div>

            {/* PLAYER CODE ENTRY */}
            <div id="jugador" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 56px 64px" }}>
              <div style={{ ...ACRYLIC_PANEL, borderRadius: 14, padding: 32, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#ff2d4f", marginBottom: 6 }}>¿Sos jugador?</div>
                  <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 20, marginBottom: 6 }}>Entrá con el código que te compartieron.</div>
                  <p style={{ fontSize: 13, opacity: 0.7, margin: 0 }}>No necesitás cuenta. Solo el código o el link de la experiencia.</p>
                  {error && <p style={{ fontSize: 12, color: "#ff2d4f", marginTop: 8 }}>{error}</p>}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePlayerSubmit()}
                    placeholder="CÓDIGO-1234"
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
                    Jugar ahora
                  </HoverAnchor>
                </div>
              </div>
            </div>

            {/* COMO FUNCIONA */}
            <div id="como-funciona" style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 56px" }}>
              <h6 style={{ fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "#ff2d4f", margin: "0 0 8px" }}>Cómo funciona</h6>
              <h2 style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 32, margin: "0 0 40px", maxWidth: "20ch" }}>Tres pasos, ningún registro.</h2>
              <div style={{ position: "relative", height: 210 }}>
                {COMO_FUNCIONA.map((item, i) => {
                  const activeSlot = (i - comoActive + COMO_FUNCIONA.length) % COMO_FUNCIONA.length === 0;
                  return (
                    <div key={item.title} style={slotStyle(i, comoActive, COMO_FUNCIONA.length, 12)}>
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
            <div id="modulos" style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 56px" }}>
              <h6 style={{ fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "#ff2d4f", margin: "0 0 8px" }}>Los módulos</h6>
              <h2 style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 32, margin: "0 0 40px", maxWidth: "24ch" }}>Cada dinámica se arma con las mismas piezas.</h2>
              <div style={{ position: "relative", height: 250 }}>
                {MODULOS.map((item, i) => {
                  const activeSlot = (i - modActive + MODULOS.length) % MODULOS.length === 0;
                  return (
                    <div key={item.title} style={slotStyle(i, modActive, MODULOS.length, 14)}>
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
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 56px" }}>
              <h6 style={{ fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "#ff2d4f", margin: "0 0 8px" }}>El armado</h6>
              <h2 style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 32, margin: "0 0 12px", maxWidth: "22ch" }}>Arrastrá, ordená, listo.</h2>
              <p style={{ fontSize: 14, opacity: 0.8, margin: "0 0 40px", maxWidth: "52ch" }}>
                El creador arma la experiencia como una colcha: módulos en el orden que quiera, cada uno con sus puntos, y las recompensas que se desbloquean al final.
              </p>

              <div style={{ ...ACRYLIC_PANEL, borderRadius: 14, boxShadow: "0 6px 18px rgba(0,0,0,0.55)", overflow: "hidden" }}>
                <BrowserChrome label="quilt.app/e/cita-sorpresa — editor" />
                <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr" }}>
                  <div style={{ padding: 24, borderRight: "1px solid rgba(233,233,237,0.16)" }}>
                    <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(233,233,237,0.55)", marginBottom: 14 }}>Módulos — 4</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[
                        { dot: "#ff7d93", text: "¿Café o té?", pts: "+10 pts" },
                        { dot: "#d81f3f", text: "Contame tu mejor recuerdo juntos", pts: "+15 pts" },
                        { dot: "#5c1424", text: "Subí una foto de un lugar que te guste", pts: "+20 pts" },
                      ].map((row) => (
                        <div key={row.text} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 8, background: "#1f151a" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" stroke="rgba(233,233,237,0.4)" strokeWidth="2" strokeLinecap="round" fill="none">
                            <line x1="4" y1="8" x2="20" y2="8"></line>
                            <line x1="4" y1="16" x2="20" y2="16"></line>
                          </svg>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: row.dot }} />
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
                        <div style={{ flex: 1, fontSize: 14 }}>+ Agregar módulo</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: 24 }}>
                    <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(233,233,237,0.55)", marginBottom: 14 }}>Recompensas</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 8, border: "1px solid rgba(233,233,237,0.16)" }}>
                        <div>
                          <div style={{ fontSize: 14 }}>Cena en casa, yo cocino</div>
                          <div style={{ fontSize: 11, color: "rgba(233,233,237,0.55)", marginTop: 2 }}>Desde 20 pts</div>
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
                          <div style={{ fontSize: 14 }}>Escapada de un día</div>
                          <div style={{ fontSize: 11, color: "#ffb3c0", marginTop: 2 }}>Desde 45 pts · con fecha</div>
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
                      Ver vista previa
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* DASHBOARD */}
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 56px" }}>
              <h6 style={{ fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "#ff2d4f", margin: "0 0 8px" }}>Tu cuenta</h6>
              <h2 style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 32, margin: "0 0 12px", maxWidth: "24ch" }}>Un dashboard para todas tus experiencias.</h2>
              <p style={{ fontSize: 14, opacity: 0.8, margin: "0 0 40px", maxWidth: "52ch" }}>
                Creás tu cuenta una sola vez. Desde ahí armás, editás y compartís cada experiencia, y veés cómo respondió cada jugador. Quien juega nunca necesita registrarse.
              </p>

              <div style={{ ...ACRYLIC_PANEL, borderRadius: 14, boxShadow: "0 6px 18px rgba(0,0,0,0.55)", overflow: "hidden" }}>
                <BrowserChrome label="quilt.app/dashboard" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr" }}>
                  <div style={{ padding: 24, borderRight: "1px solid rgba(233,233,237,0.16)" }}>
                    <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(233,233,237,0.55)", marginBottom: 14 }}>Tus experiencias</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 8, border: "1px solid #ff2d4f", background: "#1f151a" }}>
                        <div>
                          <div style={{ fontSize: 14 }}>Cita sorpresa</div>
                          <div style={{ fontSize: 11, color: "rgba(233,233,237,0.55)", marginTop: 2 }}>12 jugadas · activa</div>
                        </div>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff2d4f", boxShadow: "0 0 8px #ff2d4f" }} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 8, background: "#1f151a" }}>
                        <div>
                          <div style={{ fontSize: 14 }}>Trivia del equipo</div>
                          <div style={{ fontSize: 11, color: "rgba(233,233,237,0.55)", marginTop: 2 }}>6 jugadas · activa</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderRadius: 8, background: "#1f151a", opacity: 0.55 }}>
                        <div style={{ fontSize: 14 }}>+ Nueva experiencia</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: 24 }}>
                    <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(233,233,237,0.55)", marginBottom: 14 }}>Respuestas — Cita sorpresa</div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {[
                        { i: "MJ", bg: "rgba(255,45,79,0.18)", color: "#ffb3c0", name: "María J.", pts: "52 pts", reward: "Escapada de un día", border: true },
                        { i: "LT", bg: "rgba(79,180,255,0.18)", color: "#a8d8ff", name: "Lucas T.", pts: "38 pts", reward: "Cena en casa", border: true },
                        { i: "SP", bg: "rgba(255,190,60,0.18)", color: "#ffe0a3", name: "Sofía P.", pts: "45 pts", reward: "Escapada de un día", border: false },
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
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 56px" }}>
              <h6 style={{ fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "#ff2d4f", margin: "0 0 8px" }}>La experiencia</h6>
              <h2 style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 32, margin: "0 0 40px", maxWidth: "22ch" }}>Lo que ve quien juega, de punta a punta.</h2>
              <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center" }}>
                <div style={{ width: 220 }}>
                  <div style={{ ...ACRYLIC_PANEL, borderRadius: 24, padding: "20px 16px", height: 340, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", justifyContent: "center", gap: 12 }}>
                    <img src={logoMark} alt="Quilt" style={{ width: 40, height: 40, borderRadius: 10, display: "block" }} />
                    <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 16 }}>¿Listo para jugar?</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Alguien armó esto para vos.</div>
                    <div style={{ marginTop: 6, fontSize: 13, color: "#ff2d4f", border: "1px solid #ff2d4f", borderRadius: 8, padding: "8px 18px" }}>Empezar</div>
                  </div>
                  <div style={{ textAlign: "center", fontSize: 12, opacity: 0.6, marginTop: 10 }}>1. Bienvenida</div>
                </div>

                <div style={{ width: 220 }}>
                  <div style={{ ...ACRYLIC_PANEL, borderRadius: 24, padding: "20px 16px", height: 340, display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(233,233,237,0.14)", overflow: "hidden" }}>
                        <div style={{ width: "40%", height: "100%", background: "#ff2d4f" }} />
                      </div>
                      <div style={{ fontSize: 10, color: "#ffb3c0" }}>18 pts</div>
                    </div>
                    <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 15 }}>¿Café o té?</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ fontSize: 12, border: "1px solid #ff2d4f", color: "#ffb3c0", borderRadius: 7, padding: "9px 10px" }}>Café, sin dudarlo</div>
                      <div style={{ fontSize: 12, border: "1px solid rgba(233,233,237,0.16)", borderRadius: 7, padding: "9px 10px" }}>Té, siempre</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", fontSize: 12, opacity: 0.6, marginTop: 10 }}>2. Preguntas</div>
                </div>

                <div style={{ width: 220 }}>
                  <div style={{ ...ACRYLIC_PANEL, borderRadius: 24, padding: "20px 16px", height: 340, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 15 }}>Elegí tu premio</div>
                    <div style={{ fontSize: 10, opacity: 0.6 }}>Llegaste a 45 pts</div>
                    <div style={{ border: "1px solid #ff2d4f", borderRadius: 7, padding: 10, fontSize: 12, color: "#ffb3c0" }}>Escapada de un día</div>
                    <div style={{ border: "1px solid rgba(233,233,237,0.16)", borderRadius: 7, padding: 10, fontSize: 12 }}>Cena en casa</div>
                    <div style={{ marginTop: "auto" }}>
                      <div style={{ fontSize: 10, opacity: 0.6, marginBottom: 6 }}>Fecha y hora</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <div style={{ flex: 1, fontSize: 11, background: "#1f151a", borderRadius: 6, padding: 7 }}>Sáb 14</div>
                        <div style={{ flex: 1, fontSize: 11, background: "#1f151a", borderRadius: 6, padding: 7 }}>19:30</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", fontSize: 12, opacity: 0.6, marginTop: 10 }}>3. Recompensa</div>
                </div>

                <div style={{ width: 220 }}>
                  <div style={{ ...ACRYLIC_PANEL, borderRadius: 24, padding: "20px 16px", height: 340, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", justifyContent: "center", gap: 12 }}>
                    <i className="fa-solid fa-circle-check" style={{ fontSize: 34, color: "#ff2d4f" }} />
                    <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 16 }}>¡Listo!</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Tu elección fue enviada a quien armó esto.</div>
                    <div style={{ fontSize: 11, background: "#1f151a", borderRadius: 7, padding: "8px 12px", marginTop: 6 }}>Escapada · Sáb 14, 19:30</div>
                  </div>
                  <div style={{ textAlign: "center", fontSize: 12, opacity: 0.6, marginTop: 10 }}>4. Confirmación</div>
                </div>
              </div>
            </div>

            {/* CASOS DE USO */}
            <div id="casos" style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 56px" }}>
              <h6 style={{ fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "#ff2d4f", margin: "0 0 8px" }}>Casos de uso</h6>
              <h2 style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 32, margin: "0 0 32px", maxWidth: "22ch" }}>Nació para una cita. Sirve para cualquier dinámica.</h2>

              <div style={{ display: "inline-flex", border: "1px solid rgba(233,233,237,0.16)", borderRadius: 8, overflow: "hidden", marginBottom: 28 }}>
                {Object.entries(CASOS).map(([key, val], i) => (
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
                <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0 }}>{CASOS[tab].copy}</p>
              </div>
            </div>
          </div>
        </div>

        {/* BACK TO TOP */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 56px 72px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 26, margin: "0 0 8px" }}>¿Llegaste hasta acá?</h2>
          <p style={{ fontSize: 14, color: "rgba(233,233,237,0.65)", margin: "0 0 24px" }}>Armá tu primera experiencia y probála vos mismo.</p>
          <HoverLink
            to="/register"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 14, color: "#ffb3c0", background: "rgba(255,45,79,0.16)", border: "1.5px solid #ff2d4f", borderRadius: 8, padding: "12px 24px", boxShadow: "0 0 24px rgba(255,45,79,0.4)", transition: "transform 0.2s ease, background 0.2s ease" }}
            hoverStyle={{ background: "rgba(255,45,79,0.32)", transform: "scale(1.06)" }}
          >
            Crear cuenta gratis
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
              <i className="fa-solid fa-arrow-up" /> Volver arriba
            </HoverAnchor>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 56px 40px" }}>
          <div style={{ height: 1, background: "rgba(233,233,237,0.1)", marginBottom: 24 }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 500, fontSize: 15 }}>Quilt</div>
              <div style={{ fontSize: 12, opacity: 0.55 }}>Quilt made with love by MalvaLess ❤️</div>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <Link to="/login" style={{ fontSize: 13, color: "#e9e9ed" }}>
                Iniciar sesión
              </Link>
              <Link to="/register" style={{ fontSize: 13, color: "#ff2d4f" }}>
                Crear cuenta
              </Link>
            </div>
            <div style={{ fontSize: 12, opacity: 0.55 }}>© 2026 Quilt. Cada experiencia, a tu medida.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
