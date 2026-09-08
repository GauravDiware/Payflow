import { useNavigate } from "react-router-dom";
import { FileText, ShieldAlert, ChevronRight, Lock } from "lucide-react";
import { AppLayout, PageIntro } from "@/components/layout/AppLayout";
import { mockTransactions, mockAuditLogs } from "@/data/mockData";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  formatDateTime,
  formatShortDate,
  formatCurrency,
} from "@/utils/format";

export default function AuditorDashboard() {
  const navigate = useNavigate();
  const totalReviewed = mockTransactions.length;
  const failed = mockTransactions.filter((t) => t.status === "FAILED").length;
  const flagged = mockTransactions.filter((t) => t.status === "FLAGGED").length;

  return (
    <AppLayout title="Audit Overview">
      <PageIntro
        eyebrow="Auditor Panel"
        title="Audit Dashboard"
        description="Read-only overview of platform activity and compliance."
      />

      <div className="read-only-banner">
        <Lock size={15} />{" "}
        <span>Auditor access is read-only. No modifications can be made.</span>
      </div>

      <section className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon blue">
            <FileText size={18} />
          </div>
          <div className="summary-label">Total Transactions Reviewed</div>
          <div className="summary-amount-sm">{totalReviewed}</div>
          <div className="summary-sub">All time</div>
        </div>
        <div className="summary-card">
          <div className="summary-icon orange">
            <ShieldAlert size={18} />
          </div>
          <div className="summary-label">Failed Transactions</div>
          <div className="summary-amount-sm">{failed}</div>
          <div className="summary-sub">Require attention</div>
        </div>
        <div className="summary-card">
          <div className="summary-icon orange">
            <ShieldAlert size={18} />
          </div>
          <div className="summary-label">Flagged Transactions</div>
          <div className="summary-amount-sm">{flagged}</div>
          <div className="summary-sub">Under review</div>
        </div>
      </section>

      <section className="section-heading">
        <div>
          <h2>Recent Transactions</h2>
          <p>Latest platform transactions (read-only)</p>
        </div>
        <button
          className="text-button"
          onClick={() => navigate("/auditor/transactions")}
        >
          View All <ChevronRight size={15} />
        </button>
      </section>
      <TransactionTable data={mockTransactions.slice(0, 5)} adminMode />

      <section className="section-heading">
        <div>
          <h2>Latest Flagged Transactions</h2>
          <p>Transactions under review</p>
        </div>
        <button
          className="text-button"
          onClick={() => navigate("/auditor/flagged-transactions")}
        >
          View All Flagged <ChevronRight size={15} />
        </button>
      </section>
      <div className="flagged-summary">
        {mockTransactions
          .filter((t) => t.status === "FLAGGED")
          .map((t) => (
            <div
              className="flagged-row"
              key={t.reference}
              onClick={() => navigate("/auditor/flagged-transactions")}
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
              <div className="flagged-amount">{formatCurrency(t.amount)}</div>
              <StatusBadge status={t.status} />
              <span className="risk-badge high">HIGH</span>
            </div>
          ))}
      </div>

      <section className="section-heading">
        <div>
          <h2>Recent Audit Activity</h2>
          <p>Latest audit events</p>
        </div>
        <button
          className="text-button"
          onClick={() => navigate("/auditor/audit-logs")}
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
