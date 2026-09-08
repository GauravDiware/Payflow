import { useEffect, useState } from "react";
import { Lock, KeyRound, CheckCircle2, AlertTriangle } from "lucide-react";
import { AppLayout, PageIntro } from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { securityActivity } from "@/data/mockData";
import { changePassword, updateUser } from "@/api/client";

export default function Settings() {
  const { user, login } = useAuth();
  const { show } = useToast();
  const [tab, setTab] = useState("Profile");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  if (!user) return null;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <AppLayout title="Settings">
      <PageIntro
        eyebrow="Workspace / Settings"
        title="Settings"
        description="Manage your personal details and preferences."
      />
      <div className="settings-grid">
        <div className="settings-nav">
          {["Profile", "Security", "Notifications", "Preferences"].map((t) => (
            <button
              key={t}
              className={`settings-tab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="settings-form">
          {tab === "Profile" && (
            <div className="form-section">
              <div className="section-heading no-margin">
                <div>
                  <h2>Personal information</h2>
                  <p>Keep your account details up to date.</p>
                </div>
              </div>
              <div className="profile-edit">
                <div className="avatar profile-avatar">{initials}</div>
                <button className="text-button">Change photo</button>
              </div>
              <div className="form-grid">
                <label>
                  Full name
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </label>
                <label>
                  Email address
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
              </div>
              <button
                className="primary-button"
                disabled={savingProfile}
                onClick={async () => {
                  if (!fullName.trim() || !email.trim()) {
                    show("Name and email are required");
                    return;
                  }
                  setSavingProfile(true);
                  try {
                    const updated = await updateUser(user.id, {
                      fullName: fullName.trim(),
                      email: email.trim(),
                    });
                    login(
                      { ...user, name: updated.fullName, email: updated.email },
                      window.localStorage.getItem("payflow_token") ?? "",
                    );
                    show("Profile saved successfully");
                  } catch (error) {
                    show(
                      error instanceof Error
                        ? error.message
                        : "Profile could not be saved",
                    );
                  } finally {
                    setSavingProfile(false);
                  }
                }}
              >
                {savingProfile ? "Saving…" : "Save Changes"}
              </button>
            </div>
          )}
          {tab === "Security" && (
            <>
              <div className="form-section">
                <div className="section-heading no-margin">
                  <div>
                    <h2>Security</h2>
                    <p>Your account is protected with two-step verification.</p>
                  </div>
                  <span className="status success">
                    <i />
                    Protected
                  </span>
                </div>
                <div className="form-grid">
                  <label>
                    Current password
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(event) =>
                        setCurrentPassword(event.target.value)
                      }
                    />
                  </label>
                  <label>
                    New password
                    <input
                      type="password"
                      minLength={8}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                    />
                  </label>
                  <label>
                    Confirm new password
                    <input
                      type="password"
                      minLength={8}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                    />
                  </label>
                </div>
                <button
                  className="secondary-button"
                  disabled={savingPassword}
                  onClick={async () => {
                    if (newPassword.length < 8) {
                      show("New password must be at least 8 characters");
                      return;
                    }
                    if (newPassword !== confirmPassword) {
                      show("New passwords do not match");
                      return;
                    }
                    setSavingPassword(true);
                    try {
                      await changePassword(
                        user.id,
                        currentPassword,
                        newPassword,
                      );
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      show("Password updated successfully");
                    } catch (error) {
                      show(
                        error instanceof Error
                          ? error.message
                          : "Password could not be updated",
                      );
                    } finally {
                      setSavingPassword(false);
                    }
                  }}
                >
                  <KeyRound size={16} />{" "}
                  {savingPassword ? "Saving…" : "Change password"}
                </button>
              </div>
              <div className="form-section">
                <div className="section-heading no-margin">
                  <div>
                    <h2>Security Activity</h2>
                    <p>Recent security events on your account.</p>
                  </div>
                </div>
                <div className="security-activity-list">
                  {securityActivity.map((s) => (
                    <div key={s.id} className="security-activity-item">
                      <div className={`sa-icon ${s.type}`}>
                        {s.icon === "login" ? (
                          <CheckCircle2 size={16} />
                        ) : s.icon === "password" ? (
                          <Lock size={16} />
                        ) : (
                          <AlertTriangle size={16} />
                        )}
                      </div>
                      <div>
                        <strong>{s.title}</strong>
                        <small>{s.timestamp}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {tab === "Notifications" && (
            <div className="form-section">
              <div className="section-heading no-margin">
                <div>
                  <h2>Notification Preferences</h2>
                  <p>Choose what you want to be notified about.</p>
                </div>
              </div>
              {["Transaction alerts", "Security alerts", "Account updates"].map(
                (n) => (
                  <div key={n} className="toggle-row">
                    <span>{n}</span>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                ),
              )}
            </div>
          )}
          {tab === "Preferences" && (
            <div className="form-section">
              <div className="section-heading no-margin">
                <div>
                  <h2>Preferences</h2>
                  <p>Customize your experience.</p>
                </div>
              </div>
              <div className="form-grid">
                <label>
                  Default currency
                  <input defaultValue="INR" />
                </label>
                <label>
                  Language
                  <input defaultValue="English" />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
