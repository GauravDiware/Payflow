import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  FileText,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { getAccount } from "@/api/client";
import { mockTransactions } from "@/data/mockData";
import {
  formatCurrency,
  formatDate,
  formatShortDate,
  getInitials,
  getAvatarColor,
} from "@/utils/format";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState, ErrorState } from "@/components/common/EmptyState";
import type { Account } from "@/types";
import { useToast } from "@/context/ToastContext";

export default function AccountDetails() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { show } = useToast();
  const [account, setAccount] = useState<Account | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) return;
    getAccount(accountId)
      .then(setAccount)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [accountId]);

  if (!user) return null;

  if (loading)
    return (
      <AppLayout title="Account Details">
        <div className="panel-card">
          <p className="muted-text">Loading account...</p>
        </div>
      </AppLayout>
    );
  if (error)
    return (
      <AppLayout title="Account Details">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </AppLayout>
    );

  if (!account) {
    return (
      <AppLayout title="Account Details">
        <EmptyState
          title="Account not found"
          message="This account does not exist or has been closed."
          action={
            <button
              className="primary-button"
              onClick={() => navigate("/accounts")}
            >
              Back to Accounts
            </button>
          }
        />
      </AppLayout>
    );
  }

  const accountTxns = mockTransactions
    .filter(
      (t) =>
        t.fromAccount === account.accountNumber ||
        t.toAccount === account.accountNumber,
    )
    .slice(0, 5);
  const isBlocked = account.status === "BLOCKED";
  const isClosed = account.status === "CLOSED";

  return (
    <AppLayout title="Account Details">
      <button className="back-link" onClick={() => navigate("/accounts")}>
        <ArrowLeft size={16} /> Back to Accounts
      </button>

      <div className="account-detail-header">
        <div className="adh-top">
          <div className="account-icon large">
            <Building2 size={24} />
          </div>
          <div className="adh-info">
            <h1>
              {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
              Account
            </h1>
            <span className="adh-number">{account.accountNumber}</span>
          </div>
          <StatusBadge status={account.status} />
        </div>
        <div className="adh-balance">
          <span>Available Balance</span>
          <strong>{formatCurrency(account.balance, account.currency)}</strong>
        </div>
        <div className="adh-actions">
          {!isClosed && (
            <button
              className="primary-button"
              disabled={isBlocked}
              onClick={() => navigate("/transfer")}
            >
              <Send size={16} /> Transfer Money
            </button>
          )}
          <button
            className="secondary-button"
            onClick={() => show("Statement download started")}
          >
            <FileText size={16} /> View Statement
          </button>
        </div>
      </div>

      {isBlocked && (
        <div className="account-blocked-banner">
          <AlertTriangle size={20} />
          <div>
            <strong>This account is currently blocked.</strong>
            <p>Transfers are temporarily unavailable.</p>
          </div>
        </div>
      )}

      <div className="detail-grid">
        <div className="detail-section">
          <h2>Account Information</h2>
          <div className="detail-rows">
            <div className="detail-row">
              <span>Account Number</span>
              <strong>{account.accountNumber}</strong>
            </div>
            <div className="detail-row">
              <span>Account Type</span>
              <strong>
                {account.type.charAt(0) + account.type.slice(1).toLowerCase()}
              </strong>
            </div>
            <div className="detail-row">
              <span>Currency</span>
              <strong>{account.currency}</strong>
            </div>
            <div className="detail-row">
              <span>Status</span>
              <StatusBadge status={account.status} />
            </div>
            <div className="detail-row">
              <span>Created On</span>
              <strong>{formatDate(account.createdAt)}</strong>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <div className="section-heading no-margin">
            <div>
              <h2>Recent Activity</h2>
              <p>Latest transactions for this account</p>
            </div>
          </div>
          {accountTxns.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              message="Your transaction history will appear here after your first transfer."
            />
          ) : (
            <div className="activity-list">
              {accountTxns.map((txn) => {
                const isOutgoing = txn.fromAccount === account.accountNumber;
                return (
                  <div
                    key={txn.reference}
                    className="activity-item"
                    onClick={() => navigate(`/transactions/${txn.reference}`)}
                  >
                    <div className="transaction-name">
                      <div
                        className="transaction-avatar"
                        style={{ background: getAvatarColor(txn.toName) }}
                      >
                        {getInitials(txn.toName)}
                      </div>
                      <div>
                        <strong>{txn.toName}</strong>
                        <span>{isOutgoing ? "Transfer" : "Received"}</span>
                      </div>
                    </div>
                    <div className="activity-right">
                      <strong
                        className={
                          isOutgoing ? "amount-negative" : "amount-positive"
                        }
                      >
                        {isOutgoing ? "−" : "+"}{" "}
                        {formatCurrency(txn.amount, txn.currency)}
                      </strong>
                      <small>{formatShortDate(txn.createdAt)}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <button
            className="text-button"
            onClick={() => navigate("/transactions")}
          >
            View All Transactions
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
