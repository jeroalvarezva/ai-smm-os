"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteClientButton({ clientId, clientName }: { clientId: string; clientName: string }) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setError("");
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/clients/${clientId}`, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "The client could not be deleted. Please try again.");
        return;
      }

      router.push("/clients");
      router.refresh();
    } catch {
      setError("The client could not be deleted right now. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (!isConfirming) {
    return (
      <button type="button" className="button button-danger" onClick={() => setIsConfirming(true)}>
        Delete Client
      </button>
    );
  }

  return (
    <div className="delete-confirmation" role="alertdialog" aria-labelledby="delete-client-title" aria-describedby="delete-client-description">
      <div>
        <p className="eyebrow">Permanent action</p>
        <h3 id="delete-client-title">Delete {clientName}?</h3>
        <p id="delete-client-description">This will permanently remove the client, its Brand Profile, Strategy, and Content Items.</p>
      </div>
      <div className="delete-confirmation-actions">
        <button type="button" className="button button-secondary" onClick={() => { setError(""); setIsConfirming(false); }} disabled={isDeleting}>Cancel</button>
        <button type="button" className="button button-danger" onClick={handleDelete} disabled={isDeleting}>{isDeleting ? "Deleting..." : "Confirm Delete"}</button>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}