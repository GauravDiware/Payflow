import { useNavigate } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import type { Transaction } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  formatCurrency,
  formatShortDate,
  getInitials,
  getAvatarColor,
} from "@/utils/format";

export function TransactionTable({
  data,
  adminMode,
}: {
  data: Transaction[];
  adminMode?: boolean;
}) {
  const navigate = useNavigate();

  if (data.length === 0) return null;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Recipient</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.reference}
              className="clickable-row"
              onClick={() =>
                navigate(
                  adminMode
                    ? `/admin/transactions/${item.reference}`
                    : `/transactions/${item.reference}`,
                )
              }
            >
              <td className="ref-cell">{item.reference}</td>
              <td>
                <div className="transaction-name">
                  <div
                    className="transaction-avatar"
                    style={{ background: getAvatarColor(item.toName) }}
                  >
                    {getInitials(item.toName)}
                  </div>
                  <div>
                    <strong>{item.toName}</strong>
                    <span>{item.toAccount}</span>
                  </div>
                </div>
              </td>
              <td className="muted-cell">{formatShortDate(item.createdAt)}</td>
              <td className="amount-negative">
                {formatCurrency(item.amount, item.currency)}
              </td>
              <td>
                <StatusBadge status={item.status} />
              </td>
              <td>
                <button
                  className="row-more"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal size={17} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TransactionCard({ data }: { data: Transaction[] }) {
  const navigate = useNavigate();
  return (
    <div className="txn-card-list">
      {data.map((item) => (
        <div
          key={item.reference}
          className="txn-card"
          onClick={() => navigate(`/transactions/${item.reference}`)}
        >
          <div className="txn-card-top">
            <div className="transaction-name">
              <div
                className="transaction-avatar"
                style={{ background: getAvatarColor(item.toName) }}
              >
                {getInitials(item.toName)}
              </div>
              <div>
                <strong>{item.toName}</strong>
                <span>
                  {item.reference} · {formatShortDate(item.createdAt)}
                </span>
              </div>
            </div>
            <StatusBadge status={item.status} />
          </div>
          <div className="txn-card-bottom">
            <span>{item.description}</span>
            <strong>{formatCurrency(item.amount, item.currency)}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}
