import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { AppLayout, PageIntro } from "@/components/layout/AppLayout";
import { mockAuditLogs } from "@/data/mockData";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDateTime } from "@/utils/format";

const PAGE_SIZE = 10;

export default function AuditLogs() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [resultFilter, setResultFilter] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = mockAuditLogs;
    if (search)
      result = result.filter(
        (l) =>
          l.user.toLowerCase().includes(search.toLowerCase()) ||
          l.resource.toLowerCase().includes(search.toLowerCase()),
      );
    if (actionFilter) result = result.filter((l) => l.action === actionFilter);
    if (resultFilter) result = result.filter((l) => l.result === resultFilter);
    return result;
  }, [search, actionFilter, resultFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <AppLayout title="Audit Logs">
      <PageIntro
        eyebrow="Admin / Audit Logs"
        title="Audit Logs"
        description="Complete audit trail of all system actions."
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
            placeholder="Search user or resource"
          />
        </div>
        <select
          className="filter-select"
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Actions</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
          <option value="TRANSFER">Transfer</option>
          <option value="BENEFICIARY_ADDED">Beneficiary Added</option>
          <option value="BENEFICIARY_REMOVED">Beneficiary Removed</option>
          <option value="ACCOUNT_BLOCKED">Account Blocked</option>
          <option value="ACCOUNT_ACTIVATED">Account Activated</option>
          <option value="USER_BLOCKED">User Blocked</option>
          <option value="USER_ACTIVATED">User Activated</option>
          <option value="TRANSACTION_FLAGGED">Transaction Flagged</option>
          <option value="TRANSACTION_REVIEWED">Transaction Reviewed</option>
          <option value="PASSWORD_CHANGED">Password Changed</option>
        </select>
        <select
          className="filter-select"
          value={resultFilter}
          onChange={(e) => {
            setResultFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Results</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
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
            {paged.map((log) => (
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
    </AppLayout>
  );
}
