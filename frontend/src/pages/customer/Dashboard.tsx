import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  MoreHorizontal,
  Send,
  Plus,
  FileText,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { AppLayout, PageIntro } from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { getAccounts, getTransactions } from "@/api/client";
import { formatCurrency } from "@/utils/format";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import type { Account, Transaction } from "@/types";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = () => {
      getAccounts(user.id)
        .then(setAccounts)
        .catch(() => undefined);
      getTransactions(user.id, 0, 20)
        .then((result) => setTransactions(result.content))
        .catch(() => undefined);
    };
    load();
    // Keeps balances current when a payment is approved from another session.
    const timer = window.setInterval(load, 10000);
    return () => window.clearInterval(timer);
  }, [user]);

  if (!user) return null;

  const userAccounts = accounts;
  const totalBalance = userAccounts.reduce((sum, a) => sum + a.balance, 0);
  const userTxns = transactions;
  const sent = userTxns
    .filter(
      (t) =>
        t.status === "SUCCESS" &&
        userAccounts.some((a) => a.accountNumber === t.fromAccount),
    )
    .reduce((s, t) => s + t.amount, 0);
  const received = userTxns
    .filter(
      (t) =>
        t.status === "SUCCESS" &&
        userAccounts.some((a) => a.accountNumber === t.toAccount),
    )
    .reduce((s, t) => s + t.amount, 0);
  const recentTxns = [...userTxns]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <AppLayout title="Dashboard">
      <PageIntro
        eyebrow={new Date().toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        title={`${greeting}, ${user.name.split(" ")[0]}`}
        description="Welcome back. Here's an overview of your accounts and recent activity."
        action={
          <button
            className="primary-button"
            onClick={() => navigate("/transfer")}
          >
            <Send size={16} /> Transfer Money
          </button>
        }
      />

      <section className="summary-grid">
        <div className="summary-card total">
          <div className="summary-top">
            <span>Total Balance</span>
            <button className="more-button">
              <MoreHorizontal size={19} />
            </button>
          </div>
          <div className="summary-amount">{formatCurrency(totalBalance)}</div>
          <div className="summary-sub">
            Across {userAccounts.length} active accounts
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon blue">
            <ArrowUpRight size={18} />
          </div>
          <div className="summary-label">Money Sent</div>
          <div className="summary-amount-sm">{formatCurrency(sent)}</div>
          <div className="summary-sub">This month</div>
        </div>
        <div className="summary-card">
          <div className="summary-icon green">
            <ArrowDownLeft size={18} />
          </div>
          <div className="summary-label">Money Received</div>
          <div className="summary-amount-sm">{formatCurrency(received)}</div>
          <div className="summary-sub">This month</div>
        </div>
        <div className="summary-card">
          <div className="summary-icon green">
            <ShieldCheck size={18} />
          </div>
          <div className="summary-label">Account Status</div>
          <div className="summary-amount-sm status-text">ACTIVE</div>
          <div className="summary-sub">All accounts operational</div>
        </div>
      </section>

      <section className="section-heading">
        <div>
          <h2>My Accounts</h2>
          <p>Manage your connected accounts</p>
        </div>
        <button className="text-button" onClick={() => navigate("/accounts")}>
          View All Accounts <ChevronRight size={15} />
        </button>
      </section>
      <div className="accounts-grid">
        {userAccounts.slice(0, 3).map((acc) => (
          <div
            key={acc.id}
            className="account-card"
            onClick={() => navigate(`/accounts/${acc.id}`)}
          >
            <div className="account-card-top">
              <div className="account-icon">
                <Building2 size={18} />
              </div>
              <span className="account-tag">{acc.type}</span>
            </div>
            <div className="account-type">
              {acc.type.charAt(0) + acc.type.slice(1).toLowerCase()} Account
            </div>
            <div className="account-number">{acc.accountNumber}</div>
            <div className="account-balance">
              <span>Available Balance</span>
              <strong>{formatCurrency(acc.balance, acc.currency)}</strong>
            </div>
            <div className="account-card-footer">
              <span>
                Status:{" "}
                <span
                  className={`inline-status ${acc.status === "ACTIVE" ? "success" : "flagged"}`}
                >
                  {acc.status}
                </span>
              </span>
              <div className="account-actions">
                <button
                  className="text-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/accounts/${acc.id}`);
                  }}
                >
                  View Details <ChevronRight size={14} />
                </button>
                <button
                  className="text-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/transfer");
                  }}
                >
                  Transfer <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <button
            className="quick-action"
            onClick={() => navigate("/transfer")}
          >
            <div className="qa-icon blue">
              <Send size={20} />
            </div>
            <span>Transfer Money</span>
          </button>
          <button
            className="quick-action"
            onClick={() => navigate("/beneficiaries")}
          >
            <div className="qa-icon green">
              <Plus size={20} />
            </div>
            <span>Add Beneficiary</span>
          </button>
          <button
            className="quick-action"
            onClick={() => navigate("/transactions")}
          >
            <div className="qa-icon orange">
              <FileText size={20} />
            </div>
            <span>View Transactions</span>
          </button>
        </div>
      </section>

      <section className="section-heading">
        <div>
          <h2>Recent Transactions</h2>
          <p>Your latest 5 transactions</p>
        </div>
        <button
          className="text-button"
          onClick={() => navigate("/transactions")}
        >
          View All Transactions <ChevronRight size={15} />
        </button>
      </section>
      <TransactionTable data={recentTxns} />
    </AppLayout>
  );
}
