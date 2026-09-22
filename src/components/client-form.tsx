"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const statuses = ["ACTIVE", "INACTIVE", "ARCHIVED"] as const;

export function ClientForm() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [website, setWebsite] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);
    const websiteValue = website.trim();

    if (websiteValue) {
      try {
        const parsedWebsite = new URL(websiteValue);
        if (parsedWebsite.protocol !== "http:" && parsedWebsite.protocol !== "https:") {
          throw new Error();
        }
      } catch {
        setError("Enter a valid website URL beginning with http:// or https://.");
        return;
      }
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "The client could not be saved. Please try again.");
        return;
      }

      router.push(`/clients/${result.id}`);
      router.refresh();
    } catch {
      setError("The client could not be saved right now. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="client-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="form-field form-field-wide">
          <span>Name <b>*</b></span>
          <input name="name" required placeholder="e.g. Northstar Coffee" />
        </label>
        <label className="form-field">
          <span>Industry</span>
          <input name="industry" placeholder="e.g. Hospitality" />
        </label>
        <label className="form-field">
          <span>Website</span>
          <input
            name="website"
            type="url"
            placeholder="https://example.com"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </label>
        <label className="form-field">
          <span>Status</span>
          <select name="status" defaultValue="ACTIVE">
            {statuses.map((status) => (
              <option key={status} value={status}>{status.charAt(0) + status.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </label>
        <label className="form-field form-field-wide">
          <span>Description</span>
          <textarea name="description" rows={5} placeholder="A short description of this client" />
        </label>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-actions">
        <button type="button" className="button button-secondary" onClick={() => router.push("/clients")}>Cancel</button>
        <button type="submit" className="button button-primary" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save client"}
        </button>
      </div>
    </form>
  );
}