import { useState } from "react";
import PlayerButton from "./PlayerButton";
import logoMark from "../assets/quilt-logo-mark.png";

export default function WelcomeScreen({ experienceInfo, onSubmit }) {
  const [name, setName] = useState("");
  const [showError, setShowError] = useState(false);

  const tryStart = () => {
    if (!name.trim()) {
      setShowError(true);
      return;
    }
    onSubmit(name.trim());
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={logoMark} alt="Quilt" style={{ width: 32, height: 32, borderRadius: 8, display: "block" }} />
      </div>
      <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(233,233,237,0.5)" }}>
        {experienceInfo?.title || "Encuesta rápida"}
      </div>
      <div style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 22, lineHeight: 1.2 }}>¿Tenés unos minutos?</div>
      <p style={{ fontSize: 14, color: "rgba(233,233,237,0.65)", margin: 0, maxWidth: "30ch" }}>
        {experienceInfo?.description ||
          "Alguien te compartió esto. Respondé algunas preguntas cortas, sin necesidad de crear cuenta."}
      </p>

      <div style={{ width: "100%", textAlign: "left", marginTop: 6 }}>
        <label style={{ fontSize: 12, color: "rgba(233,233,237,0.6)", display: "block", marginBottom: 6 }}>Tu nombre</label>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setShowError(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && tryStart()}
          placeholder="¿Cómo te llamás?"
          style={{ width: "100%", height: 42, padding: "0 12px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.14)", color: "#e9e9ed", fontSize: 14, fontFamily: "Inter,system-ui,sans-serif" }}
        />
        {showError && (
          <div style={{ fontSize: 12, color: "#ff2d4f", marginTop: 6 }}>
            Necesitamos tu nombre para guardar tus respuestas.
          </div>
        )}
      </div>

      <div style={{ width: "100%", marginTop: 6 }}>
        <PlayerButton label="Empezar" onClick={tryStart} />
      </div>
    </div>
  );
}
