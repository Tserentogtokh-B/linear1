import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import "./style/Login.css";

export default function Login() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res =
        mode === "login"
          ? await api.login({ email, password })
          : await api.register({ email, name, password });
      setAuth(res.token, res.user);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-brand">
          <span className="auth-logo">A</span>
          <h1>Aurora</h1>
        </div>
        <p className="muted">
          {mode === "login"
            ? "Багийн даалгаврын систем — нэвтрэх"
            : "Шинэ бүртгэл үүсгэх"}
        </p>

        {mode === "register" && (
          <input
            placeholder="Нэр"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="И-мэйл"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="auth-password">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Нууц үг (хамгийн багадаа 6 тэмдэгт)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="auth-password-toggle"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? "Нуух" : "Харах"}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading
            ? "Түр хүлээнэ үү..."
            : mode === "login"
              ? "Нэвтрэх"
              : "Бүртгүүлэх"}
        </button>

        <button
          type="button"
          className="link"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login"
            ? "Бүртгэл байхгүй юу? Бүртгүүлэх"
            : "Бүртгэлтэй юу? Нэвтрэх"}
        </button>
      </form>
    </div>
  );
}
