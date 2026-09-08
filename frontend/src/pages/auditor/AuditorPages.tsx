import { useState, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { AppLayout, PageIntro } from "@/components/layout/AppLayout";
import { mockTransactions, mockAccounts, mockAuditLogs } from "@/data/mockData";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/format";

export function AuditorTransactions() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const filtered = useMemo(() => {
    let r = mockTransactions;
    if (search)
      r = r.filter(
        (t) =>
          t.reference.toLowerCase().includes(search.toLowerCase()) ||
          t.toName.toLowerCase().includes(search.toLowerCase()),
      );
    if (statusFilter) r = r.filter((t) => t.status === statusFilter);
    return r;
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <AppLayout title="Transactions">
      <PageIntro
        eyebrow="Auditor / Transactions"
        title="Transactions"
        description="Read-only view of all platform transactions."
      />
      <div className="read-only-banner">
        <Lock size={15} /> <span>Auditor access is read-only.</span>
      </div>
      <div className="filter-bar">
        <div className="search-box">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search transactions"
          />
        </div>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="SUCCESS">Completed</option>
          <option value="FAILED">Failed</option>
          <option value="FLAGGED">Under Review</option>
          <option value="PROCESSING">Processing</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="panel-card">
          <EmptyState
            title="No transactions found"
            message="No transactions match your filters."
          />
        </div>
      ) : (
        <>
          <TransactionTable data={paged} adminMode />
          <div className="pagination">
            <button
              className="filter-button"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronLeft size={15} /> Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="filter-button"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        </>
      )}
    </AppLayout>
  );
}

export function AuditorFlagged() {
  const flagged = mockTransactions.filter((t) => t.status === "FLAGGED");
  return (
    <AppLayout title="Flagged Transactions">
      <PageIntro
        eyebrow="Auditor / Flagged"
        title="Flagged Transactions"
        description="Read-only review of flagged transactions."
      />
      <div className="read-only-banner">
        <Lock size={15} />{" "}
        <span>
          Auditor access is read-only. No approve/reject actions available.
        </span>
      </div>
      {flagged.length === 0 ? (
        <div className="panel-card">
          <EmptyState
            title="No flagged transactions"
            message="There are no flagged transactions."
          />
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
                  <span>Status</span>
                  <StatusBadge status={t.status} />
                </div>
              </div>
              <div className="fd-reason">
                <span>Reason</span>
                <strong>{t.flagReason}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

export function AuditorAuditLogs() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const filtered = useMemo(() => {
    let r = mockAuditLogs;
    if (search)
      r = r.filter(
        (l) =>
          l.user.toLowerCase().includes(search.toLowerCase()) ||
          l.resource.toLowerCase().includes(search.toLowerCase()),
      );
    if (actionFilter) r = r.filter((l) => l.action === actionFilter);
    return r;
  }, [search, actionFilter]);

  return (
    <AppLayout title="Audit Logs">
      <PageIntro
        eyebrow="Auditor / Audit Logs"
        title="Audit Logs"
        description="Read-only audit trail of all system actions."
      />
      <div className="read-only-banner">
        <Lock size={15} /> <span>Auditor access is read-only.</span>
      </div>
      <div className="filter-bar">
        <div className="search-box">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user or resource"
          />
        </div>
        <select
          className="filter-select"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          <option value="">All Actions</option>
          <option value="LOGIN">Login</option>
          <option value="TRANSFER">Transfer</option>
          <option value="ACCOUNT_BLOCKED">Account Blocked</option>
          <option value="USER_BLOCKED">User Blocked</option>
          <option value="TRANSACTION_FLAGGED">Transaction Flagged</option>
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date &amp; Time</th>
              <th>User</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id}>
                <td className="muted-cell">{formatDateTime(log.timestamp)}</td>
                <td>
                  <strong>{log.user}</strong>
                </td>
                <td>
                  <span className="action-badge">{log.action}</span>
                </td>
                <td className="ref-cell">{log.resource}</td>
                <td>
                  <StatusBadge
                    status={log.result === "SUCCESS" ? "SUCCESS" : "FAILED"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}

export function AuditorAccounts() {
  const [search, setSearch] = useState("");
  const filtered = mockAccounts.filter(
    (a) =>
      !search ||
      a.accountNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.holderName.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <AppLayout title="Accounts">
      <PageIntro
        eyebrow="Auditor / Accounts"
        title="Accounts"
        description="Read-only view of all platform accounts."
      />
      <div className="read-only-banner">
        <Lock size={15} />{" "}
        <span>
          Auditor access is read-only. No block/activate actions available.
        </span>
      </div>
      <div className="filter-bar">
        <div className="search-box">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search account or holder"
          />
        </div>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
