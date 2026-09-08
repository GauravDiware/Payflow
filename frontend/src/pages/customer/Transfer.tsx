import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import {
  createDirectTransfer,
  createTransfer,
  getAccounts,
  getBeneficiaries,
  validateRecipientAccount,
} from "@/api/client";
import { formatCurrency } from "@/utils/format";
import { Button } from "@/components/common/Button";
import { useToast } from "@/context/ToastContext";
import type {
  Account,
  Beneficiary,
  RecipientValidation,
  TxnStatus,
} from "@/types";

type Step = "form" | "review" | "processing" | "result";

export default function Transfer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { show } = useToast();
  const [step, setStep] = useState<Step>("form");
  const [fromAccount, setFromAccount] = useState("");
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [beneficiaryId, setBeneficiaryId] = useState<string>(
    location.state?.beneficiaryId ?? "",
  );
  const [recipientAccountNumber, setRecipientAccountNumber] = useState("");
  const [recipient, setRecipient] = useState<RecipientValidation | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resultStatus, setResultStatus] = useState<TxnStatus>("SUCCESS");
  const [txnRef, setTxnRef] = useState("");

  useEffect(() => {
    if (!user) return;
    getAccounts(user.id)
      .then(setAccounts)
      .catch((err: Error) => show(err.message));
    getBeneficiaries(user.id)
      .then((loaded) => {
        setBeneficiaries(loaded);
        const selectedId = location.state?.beneficiaryId;
        if (
          selectedId &&
          loaded.some((beneficiary) => beneficiary.id === selectedId)
        )
          setBeneficiaryId(selectedId);
      })
      .catch((err: Error) => show(err.message));
  }, [user, location.state, show]);

  useEffect(() => {
    if (!recipientAccountNumber) {
      setRecipient(null);
      return;
    }
    if (!/^\d{12}$/.test(recipientAccountNumber)) {
      setRecipient({
        valid: false,
        message: "Please enter a valid account number.",
        accountHolderName: null,
      });
      return;
    }
    let active = true;
    validateRecipientAccount(recipientAccountNumber)
      .then((result) => {
        if (active) setRecipient(result);
      })
      .catch((error: Error) => {
        if (active)
          setRecipient({
            valid: false,
            message: error.message,
            accountHolderName: null,
          });
      });
    return () => {
      active = false;
    };
  }, [recipientAccountNumber]);

  if (!user) return null;

  const userAccounts = accounts.filter((a) => a.status === "ACTIVE");
  const selectedAccount = userAccounts.find((a) => a.id === fromAccount);
  const selectedBeneficiary = beneficiaries.find((b) => b.id === beneficiaryId);
  const recipientName = recipientAccountNumber
    ? recipient?.accountHolderName
    : selectedBeneficiary?.name;
  const recipientNumber =
    recipientAccountNumber || selectedBeneficiary?.accountNumber;
  const numAmount = Number(amount) || 0;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fromAccount) errs.fromAccount = "Please select a source account.";
    if (recipientAccountNumber) {
      if (!recipient?.valid)
        errs.beneficiary =
          recipient?.message ?? "Please enter a valid account number.";
    } else if (!beneficiaryId)
      errs.beneficiary =
        "Please select a beneficiary or enter an account number.";
    if (!amount || numAmount <= 0)
      errs.amount = "Amount is required and must be greater than ₹0.";
    else if (selectedAccount && numAmount > selectedAccount.balance)
      errs.amount = "Amount exceeds your available balance.";
    if (
      selectedAccount &&
      recipientNumber &&
      selectedAccount.accountNumber === recipientNumber
    )
      errs.beneficiary = "You cannot transfer money to the same account.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    if (validate()) setStep("review");
  };

  const handleConfirm = async () => {
    setStep("processing");
    try {
      if (recipientAccountNumber) {
        const transfer = await createDirectTransfer(user.id, {
          senderAccountId: fromAccount,
          recipientAccountNumber,
          amount: numAmount,
          description: description || undefined,
        });
        setTxnRef(transfer.transactionId);
        setResultStatus("SUCCESS");
      } else {
        const transaction = await createTransfer(user.id, {
          fromAccountId: fromAccount,
          beneficiaryId,
          amount: numAmount,
          description: description || undefined,
        });
        setTxnRef(transaction.reference);
        setResultStatus(transaction.status);
      }
      // Refresh from the source of truth before the customer returns to accounts/dashboard.
      const refreshedAccounts = await getAccounts(user.id);
      setAccounts(refreshedAccounts);
      setStep("result");
    } catch (err) {
      setResultStatus("FAILED");
      setErrors({
        submit:
          err instanceof Error
            ? err.message
            : "Transfer could not be completed.",
      });
      setStep("result");
    }
  };

  const handleDone = () => {
    show("Transfer completed successfully");
    navigate("/dashboard");
  };

  const stepLabels = ["Details", "Review", "Complete"];
  const stepIdx = step === "form" ? 0 : step === "review" ? 1 : 2;

  return (
    <AppLayout title="Transfer Money">
      <button className="back-link" onClick={() => navigate("/dashboard")}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="transfer-stepper">
        {stepLabels.map((label, idx) => (
          <div key={label} className="stepper-item">
            <div
              className={`stepper-circle ${idx <= stepIdx ? "active" : ""} ${idx < stepIdx ? "done" : ""}`}
            >
              {idx < stepIdx ? <CheckCircle2 size={16} /> : idx + 1}
            </div>
            <span className={idx <= stepIdx ? "active" : ""}>{label}</span>
            {idx < stepLabels.length - 1 && (
              <div className={`stepper-line ${idx < stepIdx ? "done" : ""}`} />
            )}
          </div>
        ))}
      </div>

      {step === "form" && (
        <div className="transfer-form-card">
          <div className="eyebrow">STEP 1: TRANSFER DETAILS</div>
          <h2>Enter transfer details</h2>

          <label className="form-label">From Account</label>
          <div className="account-select-list">
            {userAccounts.map((acc) => (
              <div
                key={acc.id}
                className={`account-option ${fromAccount === acc.id ? "selected" : ""}`}
                onClick={() => setFromAccount(acc.id)}
              >
                <div className="account-icon">
                  <Send size={16} />
                </div>
                <div className="account-option-info">
                  <strong>
                    {acc.type.charAt(0) + acc.type.slice(1).toLowerCase()}{" "}
                    Account
                  </strong>
                  <small>
                    {acc.accountNumber} · Available:{" "}
                    {formatCurrency(acc.balance, acc.currency)}
                  </small>
                </div>
                {fromAccount === acc.id && (
                  <CheckCircle2 size={18} className="check-icon" />
                )}
              </div>
            ))}
          </div>
          {errors.fromAccount && (
            <span className="field-error">⚠ {errors.fromAccount}</span>
          )}

          <label className="form-label">Recipient Account Number</label>
          <input
            className="text-input"
            inputMode="numeric"
            maxLength={12}
            value={recipientAccountNumber}
            onChange={(e) => {
              setRecipientAccountNumber(e.target.value.replace(/\D/g, ""));
              setBeneficiaryId("");
            }}
            placeholder="Enter 12-digit account number"
          />
          {recipient && (
            <span className={recipient.valid ? "field-hint" : "field-error"}>
              {recipient.valid
                ? `Recipient found: ${recipient.accountHolderName}`
                : recipient.message}
            </span>
          )}

          <label className="form-label">Or select a saved beneficiary</label>
          <div className="account-select-list">
            {beneficiaries.map((ben) => (
              <div
                key={ben.id}
                className={`account-option ${beneficiaryId === ben.id ? "selected" : ""}`}
                onClick={() => {
                  setBeneficiaryId(ben.id);
                  setRecipientAccountNumber("");
                }}
              >
                <div className="transaction-avatar">
                  {ben.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="account-option-info">
                  <strong>{ben.name}</strong>
                  <small>{ben.accountNumber}</small>
                </div>
                {ben.verified && (
                  <span className="verified">
                    <ShieldCheck size={14} /> Verified
                  </span>
                )}
                {beneficiaryId === ben.id && (
                  <CheckCircle2 size={18} className="check-icon" />
                )}
              </div>
            ))}
          </div>
          <button
            className="add-beneficiary-link"
            type="button"
            onClick={() =>
              navigate("/beneficiaries", {
                state: { openAdd: true, returnToTransfer: true },
              })
            }
          >
            <Send size={14} /> + Add New Beneficiary
          </button>
          {errors.beneficiary && (
            <span className="field-error">⚠ {errors.beneficiary}</span>
          )}

          <label className="form-label">Amount</label>
          <div className="amount-field-large">
            <span>₹</span>
            <input
              type="number"
              min="1"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <small className="field-hint">
            Available balance:{" "}
            {selectedAccount
              ? formatCurrency(
                  selectedAccount.balance,
                  selectedAccount.currency,
                )
              : "—"}
          </small>
          {errors.amount && (
            <span className="field-error">⚠ {errors.amount}</span>
          )}

          <label className="form-label">
            Description <span className="optional">(Optional)</span>
          </label>
          <input
            className="text-input"
            placeholder="What's this for?"
            maxLength={100}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <small className="char-count">{description.length} / 100</small>

          <Button
            fullWidth
            icon={<ChevronRight size={16} />}
            onClick={handleContinue}
            disabled={
              !fromAccount ||
              (!beneficiaryId && !recipient?.valid) ||
              numAmount <= 0 ||
              (selectedAccount ? numAmount > selectedAccount.balance : false)
            }
          >
            Review Transfer
          </Button>
        </div>
      )}

      {step === "review" && (
        <div className="transfer-review-card">
          <div className="eyebrow">STEP 2: REVIEW TRANSFER</div>
          <h2>Review Your Transfer</h2>
          <p>Please confirm that the following details are correct.</p>

          <div className="review-block">
            <div className="review-section">
              <span className="review-label">From</span>
              <div className="review-value">
                <strong>{selectedAccount?.type} Account</strong>
                <small>{selectedAccount?.accountNumber}</small>
              </div>
            </div>
            <div className="review-section">
              <span className="review-label">To</span>
              <div className="review-value">
                <strong>{recipientName}</strong>
                <small>{recipientNumber}</small>
              </div>
            </div>
            <div className="review-section">
              <span className="review-label">Amount</span>
              <strong className="review-amount">
                {formatCurrency(numAmount)}
              </strong>
            </div>
            <div className="review-section">
              <span className="review-label">Transaction Fee</span>
              <strong>₹0.00</strong>
            </div>
            <div className="review-divider" />
            <div className="review-section total">
              <span className="review-label">Total</span>
              <strong className="review-amount">
                {formatCurrency(numAmount)}
              </strong>
            </div>
            {description && (
              <div className="review-section">
                <span className="review-label">Description</span>
                <strong>{description}</strong>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setStep("form")}>
              ← Edit Details
            </Button>
            <Button icon={<ShieldCheck size={16} />} onClick={handleConfirm}>
              Confirm Transfer →
            </Button>
          </div>
          <p className="secure-note">
            <ShieldCheck size={14} /> By confirming, you authorize this
            transfer.
          </p>
        </div>
      )}

      {step === "processing" && (
        <div className="transfer-processing">
          <div className="processing-spinner" />
          <h2>Processing Transfer</h2>
          <p>Please wait while your transaction is being processed.</p>
          <p className="processing-warning">Do not close this page.</p>
        </div>
      )}

      {step === "result" && (
        <div className="transfer-result">
          {resultStatus === "SUCCESS" && (
            <>
              <div className="result-icon success">
                <CheckCircle2 size={36} />
              </div>
              <h2>Transfer Successful</h2>
              <div className="result-amount">{formatCurrency(numAmount)}</div>
              <p>Your transfer has been completed successfully.</p>
              <div className="result-ref">
                Transaction Reference <strong>{txnRef}</strong>
              </div>
              <div className="result-actions">
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/transactions/${txnRef}`)}
                >
                  View Transaction
                </Button>
                <Button onClick={handleDone}>Back to Dashboard</Button>
              </div>
            </>
          )}
          {resultStatus === "FLAGGED" && (
            <>
              <div className="result-icon flagged">
                <AlertTriangle size={36} />
              </div>
              <h2>Transaction Under Review</h2>
              <p>Your transaction requires additional verification.</p>
              <div className="result-ref">
                Transaction Reference <strong>{txnRef}</strong>
              </div>
              <div className="result-ref">
                Current Status <strong>Under Review</strong>
              </div>
              <div className="result-actions">
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/transactions/${txnRef}`)}
                >
                  View Transaction
                </Button>
                <Button onClick={handleDone}>Back to Dashboard</Button>
              </div>
            </>
          )}
          {resultStatus === "FAILED" && (
            <>
              <div className="result-icon failed">
                <XCircle size={36} />
              </div>
              <h2>Transfer Could Not Be Completed</h2>
              <p>Your transfer was not successful.</p>
              <div className="result-reason">
                <span>Reason</span>
                <strong>
                  {errors.submit ?? "Transfer could not be completed."}
                </strong>
              </div>
              <div className="result-actions">
                <Button variant="secondary" onClick={() => setStep("form")}>
                  Try Again
                </Button>
                <Button onClick={handleDone}>Back to Dashboard</Button>
              </div>
            </>
          )}
        </div>
      )}
    </AppLayout>
  );
}
