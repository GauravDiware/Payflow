import { Download, CheckCircle2, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Transaction } from "@/types";
import { formatCurrency, formatDateTime } from "@/utils/format";

export function TransactionReceipt({ txn }: { txn: Transaction }) {
  const navigate = useNavigate();

  const downloadReceipt = () => {
    const receipt = [
      "PAYFLOW TRANSFER RECEIPT",
      "",
      `Status: ${txn.status}`,
      `Amount: ${formatCurrency(txn.amount, txn.currency)}`,
      `Transaction Reference: ${txn.reference}`,
      `From: ${txn.fromAccountType} Account (${txn.fromAccount})`,
      `To: ${txn.toName} (${txn.toAccount})`,
      `Date & Time: ${formatDateTime(txn.createdAt)}`,
      `Description: ${txn.description || "—"}`,
    ].join("\n");
    const file = new Blob([receipt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payflow-receipt-${txn.reference}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="receipt">
      <div className="receipt-header">
        <div className="receipt-logo">
          <CheckCircle2 size={20} />
        </div>
        <div className="receipt-brand">payflow</div>
        <div className="receipt-type">TRANSFER RECEIPT</div>
        <div className="receipt-status success">✓ COMPLETED</div>
      </div>
      <div className="receipt-body">
        <div className="receipt-row">
          <span>Amount</span>
          <strong>{formatCurrency(txn.amount, txn.currency)}</strong>
        </div>
        <div className="receipt-divider" />
        <div className="receipt-row">
          <span>Transaction Reference</span>
          <strong>{txn.reference}</strong>
        </div>
        <div className="receipt-divider" />
        <div className="receipt-row">
          <span>From</span>
          <div className="receipt-account">
            <strong>{txn.fromAccountType} Account</strong>
            <small>{txn.fromAccount}</small>
          </div>
        </div>
        <div className="receipt-divider" />
        <div className="receipt-row">
          <span>To</span>
          <div className="receipt-account">
            <strong>{txn.toName}</strong>
            <small>{txn.toAccount}</small>
          </div>
        </div>
        <div className="receipt-divider" />
        <div className="receipt-row">
          <span>Date &amp; Time</span>
          <strong>{formatDateTime(txn.createdAt)}</strong>
        </div>
        <div className="receipt-divider" />
        <div className="receipt-row">
          <span>Description</span>
          <strong>{txn.description}</strong>
        </div>
      </div>
      <div className="receipt-footer">
        <button className="secondary-button" onClick={downloadReceipt}>
          <Download size={15} /> Download Receipt
        </button>
        <button
          className="secondary-button"
          onClick={() => navigate(`/transactions/${txn.reference}`)}
        >
          <FileText size={15} /> View Transaction
        </button>
      </div>
    </div>
  );
}
