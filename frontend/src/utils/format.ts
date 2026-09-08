import type { TxnStatus } from "@/types";

export function formatCurrency(amount: number, currency = "INR"): string {
  const symbol = currency === "INR" ? "₹" : "$";
  return `${symbol}${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getAvatarColor(name: string): string {
  const colors = [
    "#e9efff",
    "#e3f6ed",
    "#fff0d8",
    "#f1eaff",
    "#e5f4f7",
    "#fce4ec",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export const txnStatusMap: Record<TxnStatus, { label: string; class: string }> =
  {
    INITIATED: { label: "Initiated", class: "status-initiated" },
    VALIDATING: { label: "Verifying", class: "status-processing" },
    PROCESSING: { label: "Processing", class: "status-processing" },
    SUCCESS: { label: "Completed", class: "status-success" },
    FAILED: { label: "Failed", class: "status-failed" },
    FLAGGED: { label: "Under Review", class: "status-flagged" },
  };

export function getTxnStatusLabel(status: TxnStatus): string {
  return txnStatusMap[status].label;
}

export function getTxnStatusClass(status: TxnStatus): string {
  return txnStatusMap[status].class;
}
