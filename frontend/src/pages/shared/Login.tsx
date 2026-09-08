import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Lock,
  UserRound,
  UserCog,
  ScrollText,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types";
import { loginUser } from "@/api/client";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("gaurav@example.com");
  const [password, setPassword] = useState("demo1234");
  const [role, setRole] = useState<Role>("CUSTOMER");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    try {
      const response = await loginUser(email, password);
      const found = response.user;
      if (found.role !== role) {
        setError(`This profile is registered as ${found.role.toLowerCase()}.`);
        return;
      }
      login(
        {
          id: found.id,
          name: found.fullName,
          email: found.email,
          role: found.role,
          status: found.status,
          createdAt: found.createdAt,
        },
        response.token,
      );
      if (found.role === "ADMIN") navigate("/admin/dashboard");
      else if (found.role === "AUDITOR") navigate("/auditor/dashboard");
      else navigate("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign in.";
      setError(
        message === "Failed to fetch"
          ? "Unable to reach the sign-in service. Please start the backend."
          : message,
      );
    }
  };

  const roles: { value: Role; label: string; icon: typeof UserRound }[] = [
    { value: "CUSTOMER", label: "Customer", icon: UserRound },
    { value: "ADMIN", label: "Admin", icon: UserCog },
    { value: "AUDITOR", label: "Auditor", icon: ScrollText },
  ];

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="brand-mark large">
            <Sparkles size={22} />
          </div>
          <span>payflow</span>
        </div>
        <div className="login-hero">
          <h1>
            Banking made
            <br />
            simple and secure.
          </h1>
          <p>
            Transfer money, manage accounts, and track every transaction — all
            in one professional financial workspace.
          </p>
          <div className="login-features">
            <div className="login-feature">
              <ShieldCheck size={18} />
              <span>Bank-grade security</span>
            </div>
            <div className="login-feature">
              <TrendingUp size={18} />
              <span>Real-time transactions</span>
            </div>
            <div className="login-feature">
              <Lock size={18} />
              <span>Protected by design</span>
            </div>
          </div>
        </div>
      </div>
      <div className="login-right">
        <div className="login-form-wrap">
          <h2>Sign in to your account</h2>
          <p>Welcome back. Please enter your details.</p>
          <p className="login-hint">
            <button
              type="button"
              className="text-button"
              onClick={() => navigate("/register")}
            >
              Create a customer profile
            </button>{" "}
            if you are new to Payflow.
          </p>
          <form onSubmit={handleLogin} className="login-form">
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>
            <button
              type="button"
              className="text-button"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </button>
            <div className="role-selector">
              <span>Select role</span>
              <div className="role-options">
                {roles.map(({ value, label, icon: Icon }) => (
                  <button
                    type="button"
                    key={value}
                    className={`role-option ${role === value ? "active" : ""}`}
                    onClick={() => setRole(value)}
                  >
                    <Icon size={16} /> {label}
                  </button>
                ))}
              </div>
            </div>
            {error && <span className="field-error">⚠ {error}</span>}
            <button type="submit" className="primary-button wide">
              Sign In
            </button>
          </form>
          <p className="login-hint">
            Mock banking mode: use the email registered to your profile.
            Password verification is not enabled in this demo.
          </p>
        </div>
      </div>
    </div>
  );
}
