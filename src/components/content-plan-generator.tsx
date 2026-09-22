"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ContentPlanDraft } from "@/lib/ai/content-planning-generator";

const countOptions = [5, 10, 15, 20, 30];

function label(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase().replaceAll("_", " ");
}

function formatDate(value: string | null) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not scheduled" : new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

export function ContentPlanGenerator({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [count, setCount] = useState("10");
  const [draft, setDraft] = useState<ContentPlanDraft | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  async function handleGenerate() {
    setError("");
    setStatusMessage("");
    setDraft(null);
    setIsGenerating(true);

    try {
      const response = await fetch(`/api/clients/${clientId}/content/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: Number(count) }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "The content plan could not be generated right now.");
        return;
      }
      setDraft(result);
    } catch {
      setError("The content plan could not be generated right now.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave() {
    if (!draft) return;
    setError("");
    setStatusMessage("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/clients/${clientId}/content/generate/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "The content plan could not be saved right now.");
        return;
      }
      setDraft(null);
      setStatusMessage(`${result.items?.length ?? 0} content items saved successfully.`);
      router.refresh();
    } catch {
      setError("The content plan could not be saved right now.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="detail-panel ai-plan-panel" aria-labelledby="content-plan-generator-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">AI-assisted planning</p>
          <h2 id="content-plan-generator-title">Generate Content Plan</h2>
        </div>
        <div className="section-heading-actions">
          <label className="count-control">
            <span>Items</span>
            <select value={count} onChange={(event) => setCount(event.target.value)} disabled={isGenerating || isSaving}>
              {countOptions.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <button type="button" className="button button-primary" onClick={handleGenerate} disabled={isGenerating || isSaving}>
            {isGenerating ? "Generating..." : "Generate Content Plan"}
          </button>
        </div>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
      {statusMessage && <p className="form-success" role="status">{statusMessage}</p>}

      {draft && (
        <div className="ai-plan-draft">
          <div className="ai-plan-draft-heading">
            <div>
              <p className="eyebrow">AI-generated draft</p>
              <p className="section-note">Review the full plan before saving. These ideas are not saved yet.</p>
            </div>
            <div className="section-heading-actions">
              <button type="button" className="button button-secondary" onClick={() => setDraft(null)} disabled={isSaving}>Discard Draft</button>
              <button type="button" className="button button-primary" onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save Content Plan"}</button>
            </div>
          </div>
          <div className="ai-plan-table-wrap">
            <table className="ai-plan-table">
              <thead><tr><th>Title</th><th>Platform</th><th>Type</th><th>Pillar</th><th>Objective</th><th>Hook</th><th>CTA</th><th>Scheduled</th></tr></thead>
              <tbody>
                {draft.items.map((item, index) => (
                  <tr key={`${item.title}-${index}`}>
                    <td><strong>{item.title}</strong><small>{item.description}</small></td>
                    <td>{label(item.platform)}</td>
                    <td>{label(item.contentType)}</td>
                    <td>{item.contentPillar}</td>
                    <td>{item.objective}</td>
                    <td>{item.hook}</td>
                    <td>{item.callToAction}</td>
                    <td>{formatDate(item.scheduledAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
