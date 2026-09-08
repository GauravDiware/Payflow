import type { Account, Transaction } from "@/types";

const PDF_PAGE_WIDTH = 612;
const PDF_PAGE_HEIGHT = 792;
const LINES_PER_PAGE = 42;

function pdfSafe(value: string): string {
  return value
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function buildPdf(lines: string[]): Uint8Array {
  const pages = Array.from(
    { length: Math.max(1, Math.ceil(lines.length / LINES_PER_PAGE)) },
    (_, index) =>
      lines.slice(index * LINES_PER_PAGE, (index + 1) * LINES_PER_PAGE),
  );
  const objects = new Map<number, string>();
  const pageReferences = pages.map((_, index) => 4 + index * 2);
  objects.set(1, "<< /Type /Catalog /Pages 2 0 R >>");
  objects.set(
    2,
    `<< /Type /Pages /Kids [${pageReferences.map((reference) => `${reference} 0 R`).join(" ")}] /Count ${pages.length} >>`,
  );
  objects.set(3, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  pages.forEach((pageLines, index) => {
    const pageReference = pageReferences[index];
    const contentReference = pageReference + 1;
    const text = [
      "BT",
      "/F1 10 Tf",
      "48 744 Td",
      "14 TL",
      ...pageLines.map(
        (line, lineIndex) => `${lineIndex ? "T* " : ""}(${pdfSafe(line)}) Tj`,
      ),
      "ET",
    ].join("\n");
    objects.set(
      pageReference,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentReference} 0 R >>`,
    );
    objects.set(
      contentReference,
      `<< /Length ${text.length} >>\nstream\n${text}\nendstream`,
    );
  });

  let pdf = "%PDF-1.4\n%PDF statement\n";
  const offsets = [0];
  for (let reference = 1; reference <= objects.size; reference += 1) {
    offsets[reference] = pdf.length;
    pdf += `${reference} 0 obj\n${objects.get(reference)}\nendobj\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.size + 1}\n0000000000 65535 f \n`;
  for (let reference = 1; reference <= objects.size; reference += 1)
    pdf += `${offsets[reference].toString().padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.size + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

export function downloadStatementPdf(
  account: Account,
  month: Date,
  transactions: Transaction[],
): void {
  const monthLabel = month.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const entries = transactions
    .filter((transaction) => {
      const date = new Date(transaction.createdAt);
      return (
        date.getFullYear() === month.getFullYear() &&
        date.getMonth() === month.getMonth() &&
        (transaction.fromAccount === account.accountNumber ||
          transaction.toAccount === account.accountNumber)
      );
    })
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  const lines = [
    "PAYFLOW ACCOUNT STATEMENT",
    "",
    `Statement period: ${monthLabel}`,
    `Account: ${account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account`,
    `Account number: ${account.accountNumber}`,
    `Currency: ${account.currency}`,
    `Current balance: ${account.currency} ${account.balance.toFixed(2)}`,
    "",
    "DATE         DESCRIPTION                              TYPE       AMOUNT",
    "----------------------------------------------------------------------------",
  ];
  if (entries.length === 0)
    lines.push("No transactions were recorded during this statement period.");
  else
    entries.forEach((transaction) => {
      const date = new Date(transaction.createdAt).toLocaleDateString("en-GB");
      const isDebit = transaction.fromAccount === account.accountNumber;
      const description = (
        isDebit
          ? `Transfer to ${transaction.toName}`
          : `Transfer from ${transaction.toName}`
      )
        .slice(0, 39)
        .padEnd(39);
      const type = (isDebit ? "DEBIT" : "CREDIT").padEnd(10);
      lines.push(
        `${date.padEnd(13)} ${description} ${type} ${isDebit ? "-" : "+"}${account.currency} ${transaction.amount.toFixed(2)}`,
      );
    });
  lines.push(
    "",
    `Generated on: ${new Date().toLocaleString("en-IN")}`,
    "This is a computer-generated statement.",
  );
  const file = new Blob([buildPdf(lines)], { type: "application/pdf" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = `payflow-statement-${account.accountNumber}-${month.toISOString().slice(0, 7)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
