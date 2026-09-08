import { useNavigate } from "react-router-dom";
import {
  Users,
  Wallet,
  FileText,
  XCircle,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { AppLayout, PageIntro } from "@/components/layout/AppLayout";
import {
  mockUsers,
  mockAccounts,
  mockTransactions,
  mockAuditLogs,
} from "@/data/mockData";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDateTime, formatShortDate } from "@/utils/format";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const activeAccounts = mockAccounts.filter(
    (a) => a.status === "ACTIVE",
  ).length;
  const txnsToday = mockTransactions.length;
  const failed = mockTransactions.filter((t) => t.status === "FAILED").length;
  const flagged = mockTransactions.filter((t) => t.status === "FLAGGED").length;
  const flaggedTxns = mockTransactions.filter((t) => t.status === "FLAGGED");

  return (
    <AppLayout title="Admin Overview">
      <PageIntro
        eyebrow="Admin Panel"
        title="Admin Dashboard"
        description="Monitor platform activity and system health."
      />

      <section className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon blue">
            <Users size={18} />
          </div>
          <div className="summary-label">Total Users</div>
          <div className="summary-amount-sm">
            {mockUsers.length.toLocaleString()}
          </div>
          <div className="summary-sub">Registered users</div>
        </div>
        <div className="summary-card">
          <div className="summary-icon green">
            <Wallet size={18} />
          </div>
          <div className="summary-label">Active Accounts</div>
          <div className="summary-amount-sm">{activeAccounts}</div>
          <div className="summary-sub">Operational accounts</div>
        </div>
        <div className="summary-card">
          <div className="summary-icon blue">
            <FileText size={18} />
          </div>
          <div className="summary-label">Transactions Today</div>
          <div className="summary-amount-sm">{txnsToday}</div>
          <div className="summary-sub">All transactions</div>
        </div>
        <div className="summary-card">
          <div className="summary-icon orange">
            <XCircle size={18} />
          </div>
          <div className="summary-label">Failed</div>
          <div className="summary-amount-sm">{failed}</div>
          <div className="summary-sub">Failed transactions</div>
        </div>
        <div className="summary-card">
          <div className="summary-icon orange">
            <AlertTriangle size={18} />
          </div>
          <div className="summary-label">Under Review</div>
          <div className="summary-amount-sm">{flagged}</div>
          <div className="summary-sub">Flagged transactions</div>
        </div>
      </section>

      <section className="section-heading">
        <div>
          <h2>Recent Transactions</h2>
          <p>Latest platform transactions</p>
        </div>
        <button
          className="text-button"
          onClick={() => navigate("/admin/transactions")}
        >
          View All <ChevronRight size={15} />
        </button>
      </section>
      <TransactionTable data={mockTransactions.slice(0, 5)} adminMode />

      <section className="section-heading">
        <div>
          <h2>Flagged Transactions Summary</h2>
          <p>Transactions requiring review</p>
        </div>
        <button
          className="text-button"
          onClick={() => navigate("/admin/flagged-transactions")}
        >
          View All Flagged <ChevronRight size={15} />
        </button>
      </section>
      <div className="flagged-summary">
        {flaggedTxns.length === 0 ? (
          <div className="panel-card">
            <p className="muted-text">No flagged transactions.</p>
          </div>
        ) : (
          flaggedTxns.map((t) => (
            <div
              className="flagged-row"
              key={t.reference}
              onClick={() => navigate(`/admin/flagged-transactions`)}
            >
              <div className="flagged-info">
                <div className="flagged-icon">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <strong>{t.reference}</strong>
                  <span>
                    {t.toName} · {formatShortDate(t.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flagged-amount">
                ₹{t.amount.toLocaleString("en-IN")}
              </div>
              <StatusBadge status={t.status} />
              <span className="risk-badge high">HIGH</span>
            </div>
          ))
        )}
      </div>

      <section className="section-heading">
        <div>
          <h2>Recent System Activity</h2>
          <p>Latest audit events</p>
        </div>
        <button
          className="text-button"
          onClick={() => navigate("/admin/audit-logs")}
        >
          View All Logs <ChevronRight size={15} />
        </button>
      </section>
      <div className="activity-list-card">
        {mockAuditLogs.slice(0, 5).map((log) => (
          <div className="audit-row" key={log.id}>
            <div className="audit-time">{formatDateTime(log.timestamp)}</div>
            <div className="audit-user">{log.user}</div>
            <div className="audit-action">{log.action}</div>
            <div className="audit-resource">{log.resource}</div>
            <StatusBadge
              status={log.result === "SUCCESS" ? "SUCCESS" : "FAILED"}
            />
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
