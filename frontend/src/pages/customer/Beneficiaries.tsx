import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, ShieldCheck, Send, Trash2, Eye } from "lucide-react";
import { AppLayout, PageIntro } from "@/components/layout/AppLayout";
import {
  createBeneficiary,
  deleteBeneficiary,
  getBeneficiaries,
} from "@/api/client";
import { Modal, ConfirmModal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { EmptyState, ErrorState } from "@/components/common/EmptyState";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import type { Beneficiary } from "@/types";

export default function Beneficiaries() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { show } = useToast();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAdd, setShowAdd] = useState(() =>
    Boolean(location.state?.openAdd),
  );
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    accountNumber: "",
    nickname: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadBeneficiaries = () => {
    if (!user) return;
    setLoading(true);
    setError("");
    getBeneficiaries(user.id)
      .then(setBeneficiaries)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadBeneficiaries, [user]);

  const handleAdd = () => {
    const errs: Record<string, string> = {};
    if (!form.name) errs.name = "Name is required.";
    if (!form.accountNumber) errs.accountNumber = "Account number is required.";
    if (form.accountNumber === "PF100001")
      errs.accountNumber = "Account cannot be your own account.";
    if (beneficiaries.some((b) => b.accountNumber === form.accountNumber))
      errs.accountNumber = "This beneficiary already exists.";
    setFormErrors(errs);
    if (Object.keys(errs).length !== 0 || !user) return;
    setSubmitting(true);
    createBeneficiary(user.id, form)
      .then((newBeneficiary) => {
        setBeneficiaries((current) => [...current, newBeneficiary]);
        setForm({ name: "", accountNumber: "", nickname: "" });
        setShowAdd(false);
        show("Beneficiary added successfully");
        if (location.state?.returnToTransfer) {
          navigate("/transfer", {
            state: { beneficiaryId: newBeneficiary.id },
          });
        }
      })
      .catch((err: Error) => setFormErrors({ accountNumber: err.message }))
      .finally(() => setSubmitting(false));
  };

  const handleRemove = () => {
    if (!removeTarget || !user) return;
    deleteBeneficiary(user.id, removeTarget)
      .then(() => {
        setBeneficiaries((current) =>
          current.filter((b) => b.id !== removeTarget),
        );
        setRemoveTarget(null);
        show("Beneficiary removed");
      })
      .catch((err: Error) => show(err.message));
  };

  const removeBen = beneficiaries.find((b) => b.id === removeTarget);

  return (
    <AppLayout title="Beneficiaries">
      <PageIntro
        eyebrow="Workspace / Beneficiaries"
        title="Your Beneficiaries"
        description="People and businesses you can send money to."
        action={
          <button className="primary-button" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add Beneficiary
          </button>
        }
      />

      {loading ? (
        <div className="panel-card">
          <p className="muted-text">Loading beneficiaries...</p>
        </div>
      ) : error ? (
        <div className="panel-card">
          <ErrorState message={error} onRetry={loadBeneficiaries} />
        </div>
      ) : beneficiaries.length === 0 ? (
        <div className="panel-card">
          <EmptyState
            title="No beneficiaries yet"
            message="Add a beneficiary to make sending money easier."
            action={
              <Button
                icon={<Plus size={16} />}
                onClick={() => setShowAdd(true)}
              >
                Add Beneficiary
              </Button>
            }
          />
        </div>
      ) : (
        <div className="beneficiaries-list">
          {beneficiaries.map((ben) => (
            <div className="beneficiary-row" key={ben.id}>
              <div className="transaction-name">
                <div className="transaction-avatar large">
                  {ben.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <strong>{ben.name}</strong>
                  <span>{ben.accountNumber}</span>
                </div>
              </div>
              {ben.verified && (
                <span className="verified">
                  <ShieldCheck size={14} /> Verified
                </span>
              )}
              <div className="beneficiary-actions">
                <button
                  className="secondary-button small"
                  onClick={() =>
                    navigate("/transfer", { state: { beneficiaryId: ben.id } })
                  }
                >
                  <Send size={14} /> Send Money
                </button>
                <button className="icon-button small-icon">
                  <Eye size={16} />
                </button>
                <button
                  className="icon-button small-icon danger-icon"
                  onClick={() => setRemoveTarget(ben.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Beneficiary"
        eyebrow="New beneficiary"
      >
        <div className="modal-body">
          <label className="form-label">Beneficiary Name</label>
          <input
            className="text-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter name"
          />
          {formErrors.name && (
            <span className="field-error">⚠ {formErrors.name}</span>
          )}
          <label className="form-label">Account Number</label>
          <input
            className="text-input"
            value={form.accountNumber}
            onChange={(e) =>
              setForm({ ...form, accountNumber: e.target.value })
            }
            placeholder="Enter account number"
          />
          {formErrors.accountNumber && (
            <span className="field-error">⚠ {formErrors.accountNumber}</span>
          )}
          <label className="form-label">
            Nickname <span className="optional">(Optional)</span>
          </label>
          <input
            className="text-input"
            value={form.nickname}
            onChange={(e) => setForm({ ...form, nickname: e.target.value })}
            placeholder="Enter nickname"
          />
          <Button
            fullWidth
            icon={<Plus size={16} />}
            onClick={handleAdd}
            disabled={submitting}
          >
            {submitting ? "Adding..." : "Add Beneficiary"}
          </Button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        title="Remove Beneficiary?"
        message={`Are you sure you want to remove ${removeBen?.name}?`}
        confirmLabel="Remove"
        danger
      />
    </AppLayout>
  );
}
