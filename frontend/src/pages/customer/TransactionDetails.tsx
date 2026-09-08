import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getTransaction } from "@/api/client";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TransactionTimeline } from "@/components/transactions/TransactionTimeline";
import { TransactionReceipt } from "@/components/transactions/TransactionReceipt";
import { EmptyState } from "@/components/common/EmptyState";
import { useEffect, useState } from "react";
import type { Transaction } from "@/types";

export default function TransactionDetails() {
  const { reference } = useParams();
  const navigate = useNavigate();
  const [showReceipt, setShowReceipt] = useState(false);
  const [txn, setTxn] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reference) return;
    setLoading(true);
    getTransaction(reference)
      .then(setTxn)
      .catch(() => setTxn(null))
      .finally(() => setLoading(false));
  }, [reference]);

  if (loading) {
    return (
      <AppLayout title="Transaction Details">
        <div className="panel-card">
          <p className="muted-text">Loading transaction...</p>
        </div>
      </AppLayout>
    );
  }

  if (!txn) {
    return (
      <AppLayout title="Transaction Details">
        <EmptyState
          title="Transaction not found"
          message="This transaction does not exist."
          action={
            <button
              className="primary-button"
              onClick={() => navigate("/transactions")}
            >
              Back to Transactions
            </button>
          }
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Transaction Details">
      <button className="back-link" onClick={() => navigate("/transactions")}>
        <ArrowLeft size={16} /> Back to Transactions
      </button>

      <div className="txn-detail-header">
        <div className="txn-detail-top">
          <h1>Transaction Details</h1>
          <StatusBadge status={txn.status} />
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-section">
          <h2>Transaction Information</h2>
          <div className="detail-rows">
            <div className="detail-row">
              <span>Transaction Reference</span>
              <strong>{txn.reference}</strong>
            </div>
            <div className="detail-row">
              <span>From Account</span>
              <div className="detail-account">
                <strong>{txn.fromAccountType} Account</strong>
                <small>{txn.fromAccount}</small>
              </div>
            </div>
            <div className="detail-row">
              <span>To</span>
              <div className="detail-account">
                <strong>{txn.toName}</strong>
                <small>{txn.toAccount}</small>
              </div>
            </div>
            <div className="detail-row">
              <span>Amount</span>
              <strong className="amount-negative">
                {formatCurrency(txn.amount, txn.currency)}
              </strong>
            </div>
            <div className="detail-row">
              <span>Currency</span>
              <strong>{txn.currency}</strong>
            </div>
            <div className="detail-row">
              <span>Description</span>
              <strong>{txn.description}</strong>
            </div>
            <div className="detail-row">
              <span>Created At</span>
              <strong>{formatDateTime(txn.createdAt)}</strong>
            </div>
            {txn.failureReason && (
              <div className="detail-row">
                <span>Failure Reason</span>
                <strong className="error-text">{txn.failureReason}</strong>
              </div>
            )}
            {txn.flagReason && (
              <div className="detail-row">
                <span>Flag Reason</span>
                <strong className="warning-text">{txn.flagReason}</strong>
              </div>
            )}
          </div>
          <button
            className="secondary-button"
            onClick={() => setShowReceipt(true)}
          >
            <Download size={15} /> View Receipt
          </button>
        </div>

        <div className="detail-section">
          <div className="section-heading no-margin">
            <div>
              <h2>Transaction Timeline</h2>
              <p>Track the lifecycle of this transaction</p>
            </div>
          </div>
          <TransactionTimeline
            status={txn.status}
            failureReason={txn.failureReason}
            flagReason={txn.flagReason}
          />
        </div>
      </div>

      {showReceipt && (
        <div className="modal-backdrop" onClick={() => setShowReceipt(false)}>
          <div
            className="modal receipt-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div className="eyebrow">Transaction Receipt</div>
                <h2>Transfer Receipt</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowReceipt(false)}
              >
                <ArrowLeft size={18} />
              </button>
            </div>
            <TransactionReceipt txn={txn} />
          </div>
        </div>
      )}
    </AppLayout>
  );
}
