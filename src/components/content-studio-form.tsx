"use client";

import { ContentStatus, ContentType, Platform } from "@prisma/client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type ProductionValues = {
  hook: string;
  caption: string;
  script: string;
  callToAction: string;
  visualDirection: string;
  productionNotes: string;
};

type Props = { clientId: string; contentId: string; initialValues: ProductionValues };

function label(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase().replaceAll("_", " ");
}

export function ContentStudioForm({ clientId, contentId, initialValues }: Props) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateValue(field: keyof ProductionValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);
    try {
      const response = await fetch(`/api/clients/${clientId}/content-studio/${contentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "The production details could not be saved.");
        return;
      }
      setMessage("Production details saved successfully.");
    } catch {
      setError("The production details could not be saved right now.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="client-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="form-field form-field-wide"><span>Hook</span><input value={values.hook} onChange={(event) => updateValue("hook", event.target.value)} placeholder="Opening idea or angle" /></label>
        <label className="form-field form-field-wide"><span>Caption</span><textarea value={values.caption} onChange={(event) => updateValue("caption", event.target.value)} rows={6} placeholder="Working caption copy" /></label>
        <label className="form-field form-field-wide"><span>Script</span><textarea value={values.script} onChange={(event) => updateValue("script", event.target.value)} rows={8} placeholder="Draft script or spoken structure" /></label>
        <label className="form-field form-field-wide"><span>CTA</span><input value={values.callToAction} onChange={(event) => updateValue("callToAction", event.target.value)} placeholder="What should the audience do?" /></label>
        <label className="form-field form-field-wide"><span>Visual Direction</span><textarea value={values.visualDirection} onChange={(event) => updateValue("visualDirection", event.target.value)} rows={5} placeholder="Direction for visuals, framing, or design" /></label>
        <label className="form-field form-field-wide"><span>Production Notes</span><textarea value={values.productionNotes} onChange={(event) => updateValue("productionNotes", event.target.value)} rows={5} placeholder="Internal production notes" /></label>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p className="form-success" role="status">{message}</p>}
      <div className="form-actions">
        <button type="button" className="button button-secondary" onClick={() => router.push(`/clients/${clientId}/content-studio`)}>Back to Content Studio</button>
        <button type="submit" className="button button-primary" disabled={isSaving}>{isSaving ? "Saving..." : "Save production details"}</button>
      </div>
    </form>
  );
}

export type ContentStudioItem = {
  title: string;
  platform: Platform;
  contentType: ContentType;
  status: ContentStatus;
  scheduledAt: Date | null;
  updatedAt: Date;
};

export function formatStudioDate(value: Date | null) {
  return value ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(value) : "Not scheduled";
}

export { label };
