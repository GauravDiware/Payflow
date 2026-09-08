import { useState } from "react";
import { Search, Eye, Ban, CheckCircle2 } from "lucide-react";
import { AppLayout, PageIntro } from "@/components/layout/AppLayout";
import { mockAccounts } from "@/data/mockData";
import { ConfirmModal } from "@/components/common/Modal";
import { useToast } from "@/context/ToastContext";
import { formatCurrency, formatDate } from "@/utils/format";
import type { Account } from "@/types";

export default function AdminAccounts() {
  const { show } = useToast();
  const [accounts, setAccounts] = useState(mockAccounts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [target, setTarget] = useState<Account | null>(null);
  const [mode, setMode] = useState<"block" | "activate">("block");

  const filtered = accounts.filter(
    (a) =>
      (!search ||
        a.accountNumber.toLowerCase().includes(search.toLowerCase()) ||
        a.holderName.toLowerCase().includes(search.toLowerCase())) &&
      (!statusFilter || a.status === statusFilter),
  );

  const handleConfirm = () => {
    if (!target) return;
    setAccounts(
      accounts.map((a) =>
        a.id === target.id
          ? { ...a, status: mode === "block" ? "BLOCKED" : "ACTIVE" }
          : a,
      ),
    );
    show(
      mode === "block"
        ? `Account ${target.accountNumber} has been blocked`
        : `Account ${target.accountNumber} has been activated`,
    );
    setTarget(null);
  };

  return (
    <AppLayout title="Account Monitoring">
      <PageIntro
        eyebrow="Admin / Accounts"
        title="Account Monitoring"
        description="Monitor and manage all accounts on the platform."
      />

      <div className="filter-bar">
        <div className="search-box">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search account or holder"
          />
        </div>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="BLOCKED">Blocked</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Account Number</th>
              <th>Holder</th>
              <th>Type</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td className="ref-cell">{a.accountNumber}</td>
                <td>
                  <strong>{a.holderName}</strong>
                </td>
                <td className="muted-cell">{a.type}</td>
                <td className="amount-negative">
                  {formatCurrency(a.balance, a.currency)}
                </td>
                <td>
                  <span
                    className={`status ${a.status === "ACTIVE" ? "success" : "flagged"}`}
                  >
                    <i />
                    {a.status}
                  </span>
                </td>
                <td className="muted-cell">{formatDate(a.createdAt)}</td>
                <td>
                  <div className="row-actions">
                    <button className="icon-button small-icon" title="View">
                      <Eye size={16} />
                    </button>
                    {a.status === "ACTIVE" ? (
                      <button
                        className="icon-button small-icon danger-icon"
                        title="Block"
                        onClick={() => {
                          setTarget(a);
                          setMode("block");
                        }}
                      >
                        <Ban size={16} />
                      </button>
                    ) : (
                      <button
                        className="icon-button small-icon"
                        title="Activate"
                        onClick={() => {
                          setTarget(a);
                          setMode("activate");
                        }}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!target}
        onClose={() => setTarget(null)}
        onConfirm={handleConfirm}
        title={mode === "block" ? "Block Account?" : "Activate Account?"}
        message={
          mode === "block"
            ? `This will block account ${target?.accountNumber}. Transfers will be unavailable.`
            : `This will restore account ${target?.accountNumber}.`
        }
        confirmLabel={mode === "block" ? "Block Account" : "Activate Account"}
        danger={mode === "block"}
      />
    </AppLayout>
  );
}
