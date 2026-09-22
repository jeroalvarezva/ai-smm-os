"use client";

import { StrategyStatus } from "@prisma/client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export type StrategyValues = {
  status: StrategyStatus;
  objectives: string;
  audienceStrategy: string;
  contentStrategy: string;
  platformStrategy: string;
  strategicNotes: string;
};

export function StrategyForm({ clientId, initialValues }: { clientId: string; initialValues: StrategyValues }) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateValue(field: keyof StrategyValues, value: StrategyValues[keyof StrategyValues]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/clients/${clientId}/strategy`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "The Strategy could not be saved. Please try again.");
        return;
      }

      const nextValues = {
        status: result.status ?? values.status,
        objectives: result.objectives ?? "",
        audienceStrategy: result.audienceStrategy ?? "",
        contentStrategy: result.contentStrategy ?? "",
        platformStrategy: result.platformStrategy ?? "",
        strategicNotes: result.strategicNotes ?? "",
      };

      setValues(nextValues);
      setSuccess("Strategy saved successfully.");
    } catch {
      setError("The Strategy could not be saved right now. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="form-panel" onSubmit={handleSubmit}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Strategy details</p>
          <h2>Strategy overview</h2>
        </div>
      </div>

      <div className="form-grid">
        <label className="form-field">
          <span>Status</span>
          <select value={values.status} onChange={(event) => updateValue("status", event.target.value as StrategyStatus)}>
            <option value={StrategyStatus.DRAFT}>Draft</option>
            <option value={StrategyStatus.READY}>Ready</option>
            <option value={StrategyStatus.ARCHIVED}>Archived</option>
          </select>
        </label>

        <label className="form-field form-field-wide">
          <span>Objectives</span>
          <textarea value={values.objectives} onChange={(event) => updateValue("objectives", event.target.value)} rows={4} placeholder="What should social media accomplish for this client?" />
        </label>

        <label className="form-field form-field-wide">
          <span>Audience Strategy</span>
          <textarea value={values.audienceStrategy} onChange={(event) => updateValue("audienceStrategy", event.target.value)} rows={4} placeholder="How should the brand communicate with its target audience on social media?" />
        </label>

        <label className="form-field form-field-wide">
          <span>Content Strategy</span>
          <textarea value={values.contentStrategy} onChange={(event) => updateValue("contentStrategy", event.target.value)} rows={4} placeholder="What overall content approach should the brand use?" />
        </label>

        <label className="form-field form-field-wide">
          <span>Platform Strategy</span>
          <textarea value={values.platformStrategy} onChange={(event) => updateValue("platformStrategy", event.target.value)} rows={4} placeholder="How should the brand approach each selected social platform?" />
        </label>

        <label className="form-field form-field-wide">
          <span>Strategic Notes</span>
          <textarea value={values.strategicNotes} onChange={(event) => updateValue("strategicNotes", event.target.value)} rows={4} placeholder="Important strategic decisions, assumptions, constraints, or considerations." />
        </label>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
      {success && <p className="form-success" role="status">{success}</p>}

      <div className="form-actions">
        <button type="button" className="button button-secondary" onClick={() => router.push(`/clients/${clientId}`)}>Cancel</button>
        <button type="submit" className="button button-primary" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Strategy"}
        </button>
      </div>
    </form>
  );
}
