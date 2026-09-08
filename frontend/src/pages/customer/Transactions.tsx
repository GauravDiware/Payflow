import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { AppLayout, PageIntro } from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { getAccounts, getTransactions } from "@/api/client";
import {
  TransactionTable,
  TransactionCard,
} from "@/components/transactions/TransactionTable";
import { EmptyState } from "@/components/common/EmptyState";
import { useToast } from "@/context/ToastContext";
import type { Account, Transaction } from "@/types";
import { exportTransactionsToExcel } from "@/utils/exportTransactions";

const PAGE_SIZE = 5;

export default function Transactions() {
  const { user } = useAuth();
  const { show } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [page, setPage] = useState(1);
  const [isMobile] = useState(window.innerWidth < 680);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([getAccounts(user.id), getTransactions(user.id, 0, 100)])
      .then(([loadedAccounts, loadedTransactions]) => {
        setAccounts(loadedAccounts);
        setTransactions(loadedTransactions.content);
      })
      .catch((error: Error) => show(error.message))
      .finally(() => setLoading(false));
  }, [show, user]);

  if (!user) return null;
  const userAccounts = accounts;
  const userAccountNumbers = userAccounts.map((a) => a.accountNumber);

  const filtered = useMemo(() => {
    let result = transactions.filter(
      (t) =>
        userAccountNumbers.includes(t.fromAccount) ||
        userAccountNumbers.includes(t.toAccount),
    );
    if (search)
      result = result.filter(
        (t) =>
          t.reference.toLowerCase().includes(search.toLowerCase()) ||
          t.toName.toLowerCase().includes(search.toLowerCase()),
      );
    if (statusFilter) result = result.filter((t) => t.status === statusFilter);
    if (accountFilter)
      result = result.filter(
        (t) => t.fromAccount === accountFilter || t.toAccount === accountFilter,
      );
    return result;
  }, [transactions, userAccountNumbers, search, statusFilter, accountFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <AppLayout title="Transactions">
      <PageIntro
        eyebrow="Workspace / Transactions"
        title="Transactions"
        description="View and search your complete money history."
        action={
          <button
            className="secondary-button"
            onClick={() => {
              exportTransactionsToExcel(filtered);
              show(
                `${filtered.length} transaction${filtered.length === 1 ? "" : "s"} exported`,
              );
            }}
            disabled={loading || filtered.length === 0}
          >
            <Download size={16} /> Export
          </button>
        }
      />

      <div className="filter-bar">
        <div className="search-box">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by reference or name"
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
        <select
          className="filter-select"
          value={accountFilter}
          onChange={(e) => {
            setAccountFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Accounts</option>
          {userAccounts.map((a) => (
            <option key={a.id} value={a.accountNumber}>
              {a.type} · {a.accountNumber}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="panel-card">
          <p className="muted-text">Loading transactions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel-card">
          <EmptyState
            icon={<FileText size={28} />}
            title="No transactions found"
            message="Your transaction history will appear here after your first transfer."
            action={
              <button
                className="primary-button"
                onClick={() => (window.location.hash = "#/transfer")}
              >
                Transfer Money
              </button>
            }
          />
        </div>
      ) : isMobile ? (
        <TransactionCard data={paged} />
      ) : (
        <TransactionTable data={paged} />
      )}

      {filtered.length > 0 && (
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
      )}
    </AppLayout>
  );
}
