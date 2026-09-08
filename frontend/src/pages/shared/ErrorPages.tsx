import { useNavigate } from "react-router-dom";
import { ShieldX, Lock, Home } from "lucide-react";

export function Unauthorized() {
  const navigate = useNavigate();
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon danger">
          <ShieldX size={40} />
        </div>
        <div className="auth-code">403</div>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <button
          className="primary-button"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export function SessionExpired() {
  const navigate = useNavigate();
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon warning">
          <Lock size={40} />
        </div>
        <h1>Your Session Has Expired</h1>
        <p>For your security, please sign in again to continue.</p>
        <button className="primary-button" onClick={() => navigate("/login")}>
          Sign In Again
        </button>
      </div>
    </div>
  );
}

export function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">
          <Home size={40} />
        </div>
        <div className="auth-code">404</div>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <button
          className="primary-button"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
