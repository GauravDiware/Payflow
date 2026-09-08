import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser, loginUser } from "@/api/client";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    if (password.length < 8 || password !== confirmPassword) {
      setError(
        password.length < 8
          ? "Password must be at least 8 characters."
          : "Passwords do not match.",
      );
      setSaving(false);
      return;
    }
    try {
      const user = await createUser({
        fullName,
        email,
        mobileNumber,
        password,
        role: "CUSTOMER",
      });
      const authenticated = await loginUser(user.email, password);
      login(
        {
          id: authenticated.user.id,
          name: authenticated.user.fullName,
          email: authenticated.user.email,
          role: authenticated.user.role,
          status: authenticated.user.status,
          createdAt: authenticated.user.createdAt,
        },
        authenticated.token,
      );
      navigate("/accounts");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create your profile.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="login-page">
      <div className="login-right">
        <div className="login-form-wrap">
          <h2>Create your profile</h2>
          <p>Set up your mock banking profile, then add an account.</p>
          <form onSubmit={submit} className="login-form">
            <label>
              Full name
              <input
                required
                maxLength={120}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </label>
            <label>
              Email address
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              Mobile number
              <input
                required
                inputMode="numeric"
                minLength={10}
                maxLength={15}
                value={mobileNumber}
                onChange={(e) =>
                  setMobileNumber(e.target.value.replace(/\D/g, ""))
                }
              />
            </label>
            <label>
              Password
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label>
              Confirm password
              <input
                required
                type="password"
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>
            {error && <span className="field-error">⚠ {error}</span>}
            <button
              disabled={saving}
              type="submit"
              className="primary-button wide"
            >
              {saving ? "Creating profile…" : "Create Profile"}
            </button>
          </form>
          <p className="login-hint">
            <button
              type="button"
              className="text-button"
              onClick={() => navigate("/login")}
            >
              Back to sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
