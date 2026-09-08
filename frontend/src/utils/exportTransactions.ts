import type { Transaction } from "@/types";

function csvCell(value: string | number | undefined): string {
  const text = String(value ?? "");
  // Prevent spreadsheet applications from evaluating transaction data as formulas.
  const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
}

export function exportTransactionsToExcel(transactions: Transaction[]): void {
  const rows = [
    [
      "Reference",
      "Date",
      "From Account",
      "To Name",
      "To Account",
      "Amount",
      "Currency",
      "Description",
      "Status",
    ],
    ...transactions.map((transaction) => [
      transaction.reference,
      new Date(transaction.createdAt).toLocaleString("en-IN"),
      transaction.fromAccount,
      transaction.toName,
      transaction.toAccount,
      transaction.amount,
      transaction.currency,
      transaction.description,
      transaction.status,
    ]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
  const file = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = `payflow-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
