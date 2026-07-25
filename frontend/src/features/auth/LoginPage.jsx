import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../api/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const { access_token } = await api.login(email, password);
      localStorage.setItem("quilt_token", access_token);
      navigate("/dashboard");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-parchment font-sans relative overflow-hidden">
      <div className="glow-blob absolute -top-16 -left-16 w-64 h-64 rounded-full bg-gem opacity-20" />
      <div className="glow-blob-alt absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-mustard opacity-10" />
      <div className="screen-enter relative bg-void-2 border border-white/10 rounded-2xl p-8 w-full max-w-sm">
        <h1 className="font-display text-2xl mb-4">Login creador</h1>
        {error && <p className="text-gem mb-2 text-sm">{error}</p>}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          className="w-full rounded-lg border border-white/20 bg-void p-3 text-sm mb-3"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="contraseña"
          className="w-full rounded-lg border border-white/20 bg-void p-3 text-sm mb-4"
        />
        <button
          onClick={handleLogin}
          className="btn-fill w-full bg-gem py-3 rounded-xl font-semibold"
        >
          Entrar
        </button>
        <p className="text-parchment-dim text-xs mt-4 text-center">
          ¿No tenés cuenta? <Link to="/register" className="underline">Registrate</Link>
        </p>
      </div>
    </div>
  );
}