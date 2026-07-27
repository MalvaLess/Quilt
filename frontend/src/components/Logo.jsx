import { Link } from "react-router-dom";
import logoMark from "../assets/quilt-logo-mark.png";

export default function Logo({ style }) {
  return (
    <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", ...style }}>
      <img src={logoMark} alt="Quilt" style={{ width: 26, height: 26, borderRadius: 7, display: "block" }} />
      <span style={{ fontFamily: "Inter,system-ui,sans-serif", fontWeight: 600, fontSize: 17, letterSpacing: "-0.01em", color: "#e9e9ed" }}>Quilt</span>
    </Link>
  );
}
