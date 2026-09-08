import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Flag,
} from "lucide-react";
import type { TxnStatus } from "@/types";

const steps: { status: TxnStatus; label: string }[] = [
  { status: "INITIATED", label: "Initiated" },
  { status: "VALIDATING", label: "Verifying" },
  { status: "PROCESSING", label: "Processing" },
  { status: "SUCCESS", label: "Completed" },
];

export function TransactionTimeline({
  status,
  failureReason,
  flagReason,
}: {
  status: TxnStatus;
  failureReason?: string;
  flagReason?: string;
}) {
  let completedSteps: TxnStatus[] = [];

  if (status === "SUCCESS")
    completedSteps = ["INITIATED", "VALIDATING", "PROCESSING", "SUCCESS"];
  else if (status === "FAILED") completedSteps = ["INITIATED", "VALIDATING"];
  else if (status === "FLAGGED") completedSteps = ["INITIATED", "VALIDATING"];
  else if (status === "PROCESSING")
    completedSteps = ["INITIATED", "VALIDATING", "PROCESSING"];
  else if (status === "VALIDATING")
    completedSteps = ["INITIATED", "VALIDATING"];
  else completedSteps = ["INITIATED"];

  const failedAt = status === "FAILED" ? "VALIDATING" : null;
  const flaggedAt = status === "FLAGGED" ? "VALIDATING" : null;

  return (
    <div className="timeline">
      {steps.map((step, idx) => {
        const isDone = completedSteps.includes(step.status);
        const isFailed = failedAt === step.status;
        const isFlagged = flaggedAt === step.status;
        const isLast = idx === steps.length - 1;

        return (
          <div className="timeline-step" key={step.status}>
            <div className="timeline-marker-wrap">
              <div
                className={`timeline-marker ${isFailed ? "failed" : isFlagged ? "flagged" : isDone ? "done" : "pending"}`}
              >
                {isFailed ? (
                  <XCircle size={16} />
                ) : isFlagged ? (
                  <AlertTriangle size={16} />
                ) : isDone ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Clock size={16} />
                )}
              </div>
              {!isLast && (
                <div
                  className={`timeline-line ${completedSteps.includes(steps[idx + 1].status) ? "done" : ""} ${isFailed ? "failed" : ""}`}
                />
              )}
            </div>
            <div className="timeline-content">
              <strong>{step.label}</strong>
              {isFailed && failureReason && (
                <span className="timeline-reason failed">
                  Reason: {failureReason}
                </span>
              )}
              {isFlagged && flagReason && (
                <span className="timeline-reason flagged">
                  Reason: {flagReason}
                </span>
              )}
            </div>
          </div>
        );
      })}
      {status === "FLAGGED" && (
        <div className="timeline-step">
          <div className="timeline-marker-wrap">
            <div className="timeline-marker flagged">
              <Flag size={16} />
            </div>
          </div>
          <div className="timeline-content">
            <strong>Under Review</strong>
            <span className="timeline-reason flagged">
              Awaiting verification
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
