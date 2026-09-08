import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Send, Building2, ShieldCheck, Plus } from "lucide-react";
import { AppLayout, PageIntro } from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { createAccount, getAccounts } from "@/api/client";
import { formatCurrency } from "@/utils/format";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState, ErrorState } from "@/components/common/EmptyState";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import type { Account } from "@/types";

export default function Accounts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [accountType, setAccountType] = useState<Account["type"]>("SAVINGS");
  const [creating, setCreating] = useState(false);

  const loadAccounts = () => {
    if (!user) return;
    setLoading(true);
    setError("");
    getAccounts(user.id)
      .then(setAccounts)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAccounts();
    // Reflect transfers and admin approvals made in another browser session.
    const timer = window.setInterval(loadAccounts, 10000);
    return () => window.clearInterval(timer);
  }, [user]);

  if (!user) return null;

  const addAccount = () => {
    setCreating(true);
    createAccount({ userId: user.id, type: accountType, currency: "INR" })
      .then(() => {
        setShowAdd(false);
        loadAccounts();
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setCreating(false));
  };

  return (
    <AppLayout title="My Accounts">
      <PageIntro
        eyebrow="Workspace / Accounts"
        title="My Accounts"
        description="Keep track of your balances and account activity."
        action={
          <div className="modal-actions">
            <button
              className="secondary-button"
              onClick={() => setShowAdd(true)}
            >
              <Plus size={16} /> Add Account
            </button>
            <button
              className="primary-button"
              onClick={() => navigate("/transfer")}
            >
              <Send size={16} /> Transfer Money
            </button>
          </div>
        }
      />
      {loading ? (
        <div className="panel-card">
          <p className="muted-text">Loading accounts...</p>
        </div>
      ) : error ? (
        <div className="panel-card">
          <ErrorState message={error} onRetry={loadAccounts} />
        </div>
      ) : accounts.length === 0 ? (
        <div className="panel-card">
          <EmptyState
            title="No accounts found"
            message="No accounts are currently linked to your profile."
          />
        </div>
      ) : (
        <div className="accounts-grid accounts-page-grid">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="account-card"
              onClick={() => navigate(`/accounts/${acc.id}`)}
            >
              <div className="account-card-top">
                <div className="account-icon">
                  <Building2 size={18} />
                </div>
                <span className="account-tag">{acc.type}</span>
              </div>
              <div className="account-type">
                {acc.type.charAt(0) + acc.type.slice(1).toLowerCase()} Account
              </div>
              <div className="account-number">{acc.accountNumber}</div>
              <div className="account-balance">
                <span>Available Balance</span>
                <strong>{formatCurrency(acc.balance, acc.currency)}</strong>
              </div>
              <div className="account-card-footer">
                <StatusBadge status={acc.status} />
                <div className="account-actions">
                  <button
                    className="text-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/accounts/${acc.id}`);
                    }}
                  >
                    View Details <ChevronRight size={14} />
                  </button>
                  {acc.status === "ACTIVE" && (
                    <button
                      className="text-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/transfer");
                      }}
                    >
                      Transfer <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="info-panel">
        <div className="panel-icon">
          <ShieldCheck size={19} />
        </div>
        <div>
          <strong>All accounts are protected</strong>
          <p>
            Your eligible deposits are covered by deposit insurance up to the
            applicable limits.
          </p>
        </div>
      </div>
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Bank Account"
        eyebrow="Mock banking"
      >
        <div className="modal-body">
          <label className="form-label">Account type</label>
          <select
            className="text-input"
            value={accountType}
            onChange={(event) =>
              setAccountType(event.target.value as Account["type"])
            }
          >
            <option value="SAVINGS">Savings</option>
            <option value="CHECKING">Checking</option>
            <option value="CURRENT">Current</option>
          </select>
          <p className="field-hint">
            A unique 12-digit account number and a mock ₹5,000.00 opening
            balance will be created.
          </p>
          <Button fullWidth onClick={addAccount} loading={creating}>
            Create Account
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
