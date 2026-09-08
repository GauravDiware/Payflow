import { useNavigate } from "react-router-dom";
import { ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { AppLayout, PageIntro } from "@/components/layout/AppLayout";
import { mockTransactions } from "@/data/mockData";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmModal } from "@/components/common/Modal";
import { useToast } from "@/context/ToastContext";
import { formatCurrency, formatShortDate } from "@/utils/format";
import { useState } from "react";
import type { Transaction } from "@/types";

export default function FlaggedTransactions() {
  const navigate = useNavigate();
  const { show } = useToast();
  const [reviewTarget, setReviewTarget] = useState<Transaction | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">(
    "approve",
  );

  const flagged = mockTransactions.filter((t) => t.status === "FLAGGED");

  const handleConfirm = () => {
    show(
      reviewAction === "approve"
        ? `Transaction ${reviewTarget?.reference} approved`
        : `Transaction ${reviewTarget?.reference} rejected`,
    );
    setReviewTarget(null);
  };

  return (
    <AppLayout title="Flagged Transactions">
      <PageIntro
        eyebrow="Admin / Flagged"
        title="Flagged Transactions"
        description="Review transactions that require additional verification."
      />

      {flagged.length === 0 ? (
        <div className="panel-card">
          <p className="muted-text">No flagged transactions.</p>
        </div>
      ) : (
        <div className="flagged-list">
          {flagged.map((t) => (
            <div className="flagged-detail-card" key={t.reference}>
              <div className="flagged-detail-top">
                <div className="flagged-icon">
                  <ShieldAlert size={20} />
                </div>
                <strong>{t.reference}</strong>
                <span className="risk-badge high">{t.riskLevel}</span>
              </div>
              <div className="flagged-detail-grid">
                <div className="fd-row">
                  <span>Amount</span>
                  <strong>{formatCurrency(t.amount, t.currency)}</strong>
                </div>
                <div className="fd-row">
                  <span>Sender</span>
                  <strong>{t.fromAccount}</strong>
                </div>
                <div className="fd-row">
                  <span>Receiver</span>
                  <strong>
                    {t.toName} · {t.toAccount}
                  </strong>
                </div>
                <div className="fd-row">
                  <span>Date</span>
                  <strong>{formatShortDate(t.createdAt)}</strong>
                </div>
                <div className="fd-row">
                  <span>Status</span>
                  <StatusBadge status={t.status} />
                </div>
              </div>
              <div className="fd-reason">
                <span>Reason</span>
                <strong>{t.flagReason}</strong>
              </div>
              <div className="flagged-detail-actions">
                <button
                  className="secondary-button small"
                  onClick={() => navigate(`/admin/transactions/${t.reference}`)}
                >
                  View Details
                </button>
                <button
                  className="primary-button small"
                  onClick={() => {
                    setReviewTarget(t);
                    setReviewAction("approve");
                  }}
                >
                  <CheckCircle2 size={14} /> Approve
                </button>
                <button
                  className="danger-button small"
                  onClick={() => {
                    setReviewTarget(t);
                    setReviewAction("reject");
                  }}
                >
                  <XCircle size={14} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        onConfirm={handleConfirm}
        title={
          reviewAction === "approve"
            ? "Approve Transaction?"
            : "Reject Transaction?"
        }
        message={
          reviewAction === "approve"
            ? `Are you sure you want to approve ${reviewTarget?.reference}?`
            : `Are you sure you want to reject ${reviewTarget?.reference}?`
        }
        confirmLabel={reviewAction === "approve" ? "Approve" : "Reject"}
        danger={reviewAction === "reject"}
      />
    </AppLayout>
  );
}
