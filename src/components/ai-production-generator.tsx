"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ContentProductionDraft } from "@/lib/ai/content-production-generator";

const fields: Array<{ key: keyof ContentProductionDraft; label: string; rows: number }> = [
  { key: "hook", label: "Hook", rows: 2 },
  { key: "caption", label: "Caption", rows: 5 },
  { key: "script", label: "Script", rows: 6 },
  { key: "callToAction", label: "CTA", rows: 2 },
  { key: "visualDirection", label: "Visual Direction", rows: 4 },
  { key: "productionNotes", label: "Production Notes", rows: 4 },
  { key: "onScreenText", label: "On-screen Text", rows: 4 },
  { key: "shotList", label: "Shot List", rows: 5 },
  { key: "aiImagePrompt", label: "AI Image Prompt", rows: 5 },
  { key: "aiVideoPrompt", label: "AI Video Prompt", rows: 5 },
  { key: "voiceover", label: "Voiceover", rows: 4 },
  { key: "soundDirection", label: "Sound Direction", rows: 3 },
  { key: "thumbnailDirection", label: "Thumbnail Direction", rows: 3 },
];

export function AIProductionGenerator({ clientId, contentId }: { clientId: string; contentId: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState<ContentProductionDraft | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function generate() {
    setError("");
    setMessage("");
    setDraft(null);
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/clients/${clientId}/content-studio/${contentId}/generate`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "The production draft could not be generated right now.");
        return;
      }
      setDraft(result);
    } catch {
      setError("The production draft could not be generated right now.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function saveDraft() {
    if (!draft) return;
    setError("");
    setMessage("");
    setIsSaving(true);
    try {
      const response = await fetch(`/api/clients/${clientId}/content-studio/${contentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "The AI production draft could not be saved.");
        return;
      }
      setDraft(null);
      setMessage("AI production draft saved successfully.");
      router.refresh();
    } catch {
      setError("The AI production draft could not be saved right now.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="detail-panel ai-production-panel" aria-labelledby="ai-production-title">
      <div className="section-heading">
        <div><p className="eyebrow">AI-assisted production</p><h2 id="ai-production-title">AI Content Production</h2></div>
        <button type="button" className="button button-primary" onClick={generate} disabled={isGenerating || isSaving}>{isGenerating ? "Generating..." : "Generate Full Production Draft"}</button>
      </div>
      <p className="section-note">Generate a reviewable draft using the Brand Brain, saved Strategy, and this Content Item. Existing production fields stay unchanged until you save.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p className="form-success" role="status">{message}</p>}
      {draft && (
        <div className="ai-production-draft">
          <div className="ai-production-draft-heading"><div><p className="eyebrow">AI production draft</p><p className="section-note">Review before applying these fields to Content Studio.</p></div><div className="section-heading-actions"><button type="button" className="button button-secondary" onClick={() => setDraft(null)} disabled={isSaving}>Discard</button><button type="button" className="button button-primary" onClick={saveDraft} disabled={isSaving}>{isSaving ? "Saving..." : "Save AI Draft"}</button></div></div>
          <div className="ai-production-draft-grid">
            {fields.map((field) => <div className="ai-production-draft-field" key={field.key}><dt>{field.label}</dt><dd>{draft[field.key] || "Not generated for this format"}</dd></div>)}
          </div>
        </div>
      )}
    </section>
  );
}
