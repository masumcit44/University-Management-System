import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import api from "../services/api";
import Modal from "./Modal";
import Field, { CONTROL_CLASS } from "./Field";

// Change-the-owner's-own-password dialog. Calls the existing
// authenticated /auth/change-password endpoint; the backend validates
// the current password and 6+ character rule on its side too.
function ChangePasswordModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not change the password. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Change Password"
      saveLabel={success ? "Done" : saving ? "Saving…" : "Save"}
      onClose={onClose}
      onSave={success ? onClose : handleSave}
    >
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 border border-danger border-l-4 bg-danger-soft pl-3 pr-3.5 py-2.5 mb-4"
        >
          <AlertTriangle size={14} strokeWidth={2} className="text-danger shrink-0 mt-px" />
          <p className="text-[0.8125rem] text-danger leading-relaxed">{error}</p>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start gap-2.5 border border-ok border-l-4 bg-ok-soft pl-3 pr-3.5 py-2.5 mb-4"
        >
          <CheckCircle2 size={14} strokeWidth={2} className="text-ok shrink-0 mt-px" />
          <p className="text-[0.8125rem] text-ok leading-relaxed">
            Password changed successfully. Use your new password next time
            you sign in.
          </p>
        </div>
      )}

      <Field label="Current password">
        <input
          type="password"
          className={CONTROL_CLASS}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
      </Field>

      <Field label="New password">
        <input
          type="password"
          className={CONTROL_CLASS}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          placeholder="At least 6 characters"
        />
      </Field>

      <Field label="Confirm new password">
        <input
          type="password"
          className={CONTROL_CLASS}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
      </Field>
    </Modal>
  );
}

export default ChangePasswordModal;
