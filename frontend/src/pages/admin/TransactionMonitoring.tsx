import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { AppLayout, PageIntro } from "@/components/layout/AppLayout";
import { mockTransactions } from "@/data/mockData";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { EmptyState } from "@/components/common/EmptyState";

const PAGE_SIZE = 8;

export default function TransactionMonitoring() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = mockTransactions;
    if (search)
      result = result.filter(
        (t) =>
          t.reference.toLowerCase().includes(search.toLowerCase()) ||
          t.toName.toLowerCase().includes(search.toLowerCase()) ||
          t.fromAccount.toLowerCase().includes(search.toLowerCase()),
      );
    if (statusFilter) result = result.filter((t) => t.status === statusFilter);
    return result;
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <AppLayout title="Transaction Monitoring">
      <PageIntro
        eyebrow="Admin / Transactions"
        title="Transaction Monitoring"
        description="View and monitor all platform transactions."
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
            placeholder="Search reference, name, or account"
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
