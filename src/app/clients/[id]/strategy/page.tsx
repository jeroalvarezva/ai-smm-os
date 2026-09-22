"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StrategyStatus } from "@prisma/client";
import { Sidebar } from "@/components/sidebar";

type StrategyValues = {
  status: StrategyStatus;
  objectives: string;
  audienceStrategy: string;
  contentStrategy: string;
  platformStrategy: string;
  strategicNotes: string;
};

const emptyState: StrategyValues = {
  status: StrategyStatus.DRAFT,
  objectives: "",
  audienceStrategy: "",
  contentStrategy: "",
  platformStrategy: "",
  strategicNotes: "",
};

export default function StrategyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [values, setValues] = useState<StrategyValues>(emptyState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    async function loadStrategy() {
      const resolved = await params;
      const id = resolved.id;
      setClientId(id);

      const clientResponse = await fetch(`/api/clients/${id}`);
      if (!clientResponse.ok) {
        router.push("/clients");
        return;
      }

      const clientData = await clientResponse.json();
      setClientName(clientData.name ?? "Client");

      const response = await fetch(`/api/clients/${id}/strategy`);
      if (!response.ok) {
        if (response.status === 404) {
          setValues(emptyState);
          setIsLoading(false);
          return;
        }

        setError("The strategy could not be loaded right now.");
        setIsLoading(false);
        return;
      }

      const strategy = await response.json();
      setValues({
        status: strategy?.status ?? StrategyStatus.DRAFT,
        objectives: strategy?.objectives ?? "",
        audienceStrategy: strategy?.audienceStrategy ?? "",
        contentStrategy: strategy?.contentStrategy ?? "",
        platformStrategy: strategy?.platformStrategy ?? "",
        strategicNotes: strategy?.strategicNotes ?? "",
      });
      setIsLoading(false);
    }

    void loadStrategy();
  }, [params, router]);

  function updateValue(field: keyof StrategyValues, value: StrategyValues[keyof StrategyValues]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatusMessage("");
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

      setStatusMessage("Strategy saved successfully.");
      setValues({
        status: result.status ?? values.status,
        objectives: result.objectives ?? "",
        audienceStrategy: result.audienceStrategy ?? "",
        contentStrategy: result.contentStrategy ?? "",
        platformStrategy: result.platformStrategy ?? "",
        strategicNotes: result.strategicNotes ?? "",
      });
    } catch {
      setError("The Strategy could not be saved right now. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const hasStrategy = Boolean(
    values.objectives ||
      values.audienceStrategy ||
      values.contentStrategy ||
      values.platformStrategy ||
      values.strategicNotes ||
      values.status !== StrategyStatus.DRAFT,
  );

  return (
    <div className="app-shell">
      <Sidebar activePath="/clients" />
      <main className="main-content">
        <header className="page-header page-header-stacked">
          <div>
            <Link className="back-link" href={`/clients/${clientId}`}>&lt;- Back to {clientName || "Client"}</Link>
            <p className="eyebrow">{clientName || "Client"}</p>
            <h1>Strategy</h1>
            <p className="page-description">This is the client&apos;s social media strategy foundation.</p>
          </div>
        </header>

        <section className="detail-panel" aria-labelledby="strategy-facts-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Brand Brain connection</p>
              <h2 id="strategy-facts-title">Strategy foundation</h2>
            </div>
            <Link className="button button-secondary" href={`/clients/${clientId}/brand-brain`}>View Brand Brain</Link>
          </div>

          {!isLoading && !hasStrategy ? (
            <div className="brand-profile-empty" style={{ marginTop: 16 }}>
              <div className="empty-state-icon" aria-hidden="true">+</div>
              <div>
                <h3>Strategy not created yet</h3>
                <p>The strategy will eventually be generated from the client&apos;s Brand Brain.</p>
              </div>
              <button
                type="button"
                className="button button-primary"
                onClick={() => setValues({ ...emptyState, status: StrategyStatus.DRAFT })}
              >
                Create Strategy
              </button>
            </div>
          ) : null}
        </section>

        <form className="form-panel" onSubmit={handleSubmit} style={{ marginTop: 24 }}>
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
          {statusMessage && <p className="form-success" role="status">{statusMessage}</p>}

          <div className="form-actions">
            <button type="button" className="button button-secondary" onClick={() => router.push(`/clients/${clientId}`)}>Cancel</button>
            <button type="submit" className="button button-primary" disabled={isSaving || isLoading}>
              {isSaving ? "Saving..." : "Save Strategy"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
