import { useEffect, useState } from "react";
import { FileText, Download, ChevronDown } from "lucide-react";
import { AppLayout, PageIntro } from "@/components/layout/AppLayout";
import { useToast } from "@/context/ToastContext";
import { getAccounts, getTransactions } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import type { Account, Transaction } from "@/types";
import { downloadStatementPdf } from "@/utils/statementPdf";

export default function Statements() {
  const { show } = useToast();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const months = ["August 2026", "July 2026", "June 2026", "May 2026"];

  useEffect(() => {
    if (!user) return;
    Promise.all([getAccounts(user.id), getTransactions(user.id, 0, 500)])
      .then(([loadedAccounts, loadedTransactions]) => {
        setAccounts(loadedAccounts);
        setTransactions(loadedTransactions.content);
      })
      .catch((error: Error) => show(error.message));
  }, [show, user]);

  const handleDownload = (monthLabel: string) => {
    const account = accounts[0];
    if (!account) return;
    downloadStatementPdf(account, new Date(`${monthLabel} 1`), transactions);
    show(`${monthLabel} statement downloaded`);
  };

  return (
    <AppLayout title="Statements">
      <PageIntro
        eyebrow="Workspace / Statements"
        title="Statements"
        description="Download monthly statements for your accounts."
      />
      <div className="statement-panel">
        <div className="statement-selector">
          <div className="account-icon">
            <FileText size={18} />
          </div>
          <div>
            <span>Statement for</span>
            <strong>Savings Account · PF100001</strong>
          </div>
          <ChevronDown size={17} />
        </div>
        {months.map((month) => (
          <div className="statement-row" key={month}>
            <div className="statement-file">
              <FileText size={18} />
              <div>
                <strong>{month} statement</strong>
                <span>PDF · 248 KB</span>
              </div>
            </div>
            <button
              className="text-button"
              onClick={() => handleDownload(month)}
              disabled={!accounts[0]}
            >
              <Download size={15} /> Download
            </button>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
