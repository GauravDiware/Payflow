import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Loader2,
  Flag,
} from "lucide-react";
import type { AccountStatus, TxnStatus } from "@/types";
import { getTxnStatusLabel } from "@/utils/format";

export function StatusBadge({ status }: { status: TxnStatus | AccountStatus }) {
  const config: Record<string, { icon: typeof CheckCircle2; class: string }> = {
    SUCCESS: { icon: CheckCircle2, class: "status-success" },
    ACTIVE: { icon: CheckCircle2, class: "status-success" },
    FAILED: { icon: XCircle, class: "status-failed" },
    FLAGGED: { icon: Flag, class: "status-flagged" },
    PROCESSING: { icon: Loader2, class: "status-processing" },
    VALIDATING: { icon: Loader2, class: "status-processing" },
    INITIATED: { icon: Clock, class: "status-initiated" },
    BLOCKED: { icon: AlertTriangle, class: "status-flagged" },
    CLOSED: { icon: XCircle, class: "status-failed" },
  };

  const c = config[status] ?? config.INITIATED;
  const Icon = c.icon;
  const label =
    status in
    {
      SUCCESS: 1,
      FAILED: 1,
      FLAGGED: 1,
      PROCESSING: 1,
      VALIDATING: 1,
      INITIATED: 1,
    }
      ? getTxnStatusLabel(status as TxnStatus)
      : status;

  return (
    <span className={`status ${c.class}`}>
      <Icon
        size={12}
        className={
          status === "PROCESSING" || status === "VALIDATING" ? "spin" : ""
        }
      />
      {label}
    </span>
  );
}
