import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../api/client";
import logoMark from "../../assets/quilt-logo-mark.png";
import Logo from "../../components/Logo";

const inputStyle = {
  width: "100%",
  height: 42,
  padding: "0 12px",
  borderRadius: 9,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.14)",
  color: "#e9e9ed",
  fontSize: 14,
  fontFamily: "Inter,system-ui,sans-serif",
};

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email.trim() || !password) {
      setError("Email y contraseña son obligatorios");
      return;
    }
    try {
      await api.register(email, password, displayName);
      const { access_token } = await api.login(email, password);
      localStorage.setItem("quilt_token", access_token);
      navigate("/dashboard");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#e9e9ed", fontFamily: "Inter,system-ui,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <Logo style={{ position: "fixed", top: 24, left: 28 }} />
      <div style={{ width: "100%", maxWidth: 380, background: "rgba(255,255,255,0.045)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 32 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <img src={logoMark} alt="Quilt" style={{ width: 36, height: 36, borderRadius: 9 }} />
          <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 19 }}>Crear cuenta</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {error && <p style={{ color: "#ff2d4f", fontSize: 13, margin: 0 }}>{error}</p>}
          <div>
            <label style={{ fontSize: 12, color: "rgba(233,233,237,0.6)", display: "block", marginBottom: 6 }}>Nombre</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Tu nombre" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "rgba(233,233,237,0.6)", display: "block", marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vos@email.com" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "rgba(233,233,237,0.6)", display: "block", marginBottom: 6 }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>
          <div
            onClick={handleRegister}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 14, color: "#ffb3c0", background: "rgba(255,45,79,0.16)", border: "1.5px solid #ff2d4f", borderRadius: 9, padding: 12, boxShadow: "0 0 18px rgba(255,45,79,0.3)", cursor: "pointer", marginTop: 6 }}
          >
            Crear cuenta
          </div>
        </div>

        <div style={{ textAlign: "center", fontSize: 13, color: "rgba(233,233,237,0.55)", marginTop: 18 }}>
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" style={{ color: "#ffb3c0", fontWeight: 600 }}>
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
