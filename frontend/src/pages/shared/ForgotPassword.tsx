import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "@/api/client";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await resetPassword(email, mobileNumber, newPassword);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to reset password.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-right">
        <div className="login-form-wrap">
          {done ? (
            <>
              <h2>Password reset successfully</h2>
              <p>
                Your password has been updated. You can now sign in with the new
                password.
              </p>
              <button
                className="primary-button wide"
                onClick={() => navigate("/login")}
              >
                Return to sign in
              </button>
            </>
          ) : (
            <>
              <h2>Reset your password</h2>
              <p>
                Verify your registered email and mobile number to set a new
                password.
              </p>
              <form onSubmit={submit} className="login-form">
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
                  New password
                  <input
                    required
                    type="password"
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </label>
                <label>
                  Confirm new password
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
                  {saving ? "Resetting…" : "Reset Password"}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
