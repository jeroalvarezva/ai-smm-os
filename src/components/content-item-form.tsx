"use client";

import { ContentStatus, ContentType, Platform } from "@prisma/client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type ContentValues = {
  title: string;
  description: string;
  platform: Platform;
  contentType: ContentType;
  contentPillar: string;
  objective: string;
  targetAudience: string;
  hook: string;
  callToAction: string;
  scheduledAt: string;
  status: ContentStatus;
  notes: string;
};

type ContentItemFormProps = {
  clientId: string;
  contentId?: string;
  initialValues?: Partial<ContentValues>;
};

const platforms = Object.values(Platform);
const contentTypes = Object.values(ContentType);
const statuses = Object.values(ContentStatus);

function label(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase().replaceAll("_", " ");
}

function localDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function ContentItemForm({ clientId, contentId, initialValues }: ContentItemFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ContentValues>({
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    platform: initialValues?.platform ?? Platform.INSTAGRAM,
    contentType: initialValues?.contentType ?? ContentType.POST,
    contentPillar: initialValues?.contentPillar ?? "",
    objective: initialValues?.objective ?? "",
    targetAudience: initialValues?.targetAudience ?? "",
    hook: initialValues?.hook ?? "",
    callToAction: initialValues?.callToAction ?? "",
    scheduledAt: localDateTime(initialValues?.scheduledAt),
    status: initialValues?.status ?? ContentStatus.DRAFT,
    notes: initialValues?.notes ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  function updateValue(field: keyof ContentValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(contentId ? `/api/clients/${clientId}/content/${contentId}` : `/api/clients/${clientId}/content`, {
        method: contentId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "The content item could not be saved. Please try again.");
        return;
      }

      router.push(`/clients/${clientId}/content`);
      router.refresh();
    } catch {
      setError("The content item could not be saved right now. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="client-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="form-field form-field-wide">
          <span>Title <b>*</b></span>
          <input value={values.title} onChange={(event) => updateValue("title", event.target.value)} required placeholder="e.g. Three ways to simplify weekly reporting" />
        </label>
        <label className="form-field">
          <span>Platform <b>*</b></span>
          <select value={values.platform} onChange={(event) => updateValue("platform", event.target.value)} required>
            {platforms.map((value) => <option key={value} value={value}>{label(value)}</option>)}
          </select>
        </label>
        <label className="form-field">
          <span>Content type <b>*</b></span>
          <select value={values.contentType} onChange={(event) => updateValue("contentType", event.target.value)} required>
            {contentTypes.map((value) => <option key={value} value={value}>{label(value)}</option>)}
          </select>
        </label>
        <label className="form-field">
          <span>Status</span>
          <select value={values.status} onChange={(event) => updateValue("status", event.target.value)}>
            {statuses.map((value) => <option key={value} value={value}>{label(value)}</option>)}
          </select>
        </label>
        <label className="form-field">
          <span>Scheduled date</span>
          <input type="datetime-local" value={values.scheduledAt} onChange={(event) => updateValue("scheduledAt", event.target.value)} />
        </label>
        <label className="form-field form-field-wide">
          <span>Description</span>
          <textarea value={values.description} onChange={(event) => updateValue("description", event.target.value)} rows={4} placeholder="What is this item about?" />
        </label>
        <label className="form-field">
          <span>Content pillar</span>
          <input value={values.contentPillar} onChange={(event) => updateValue("contentPillar", event.target.value)} placeholder="e.g. Education" />
        </label>
        <label className="form-field">
          <span>Objective</span>
          <input value={values.objective} onChange={(event) => updateValue("objective", event.target.value)} placeholder="e.g. Build awareness" />
        </label>
        <label className="form-field form-field-wide">
          <span>Target audience</span>
          <input value={values.targetAudience} onChange={(event) => updateValue("targetAudience", event.target.value)} placeholder="Who is this for?" />
        </label>
        <label className="form-field">
          <span>Hook</span>
          <textarea value={values.hook} onChange={(event) => updateValue("hook", event.target.value)} rows={3} placeholder="Opening idea or angle" />
        </label>
        <label className="form-field">
          <span>Call to action</span>
          <textarea value={values.callToAction} onChange={(event) => updateValue("callToAction", event.target.value)} rows={3} placeholder="What should the audience do?" />
        </label>
        <label className="form-field form-field-wide">
          <span>Notes</span>
          <textarea value={values.notes} onChange={(event) => updateValue("notes", event.target.value)} rows={4} placeholder="Internal planning notes" />
        </label>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions">
        <button type="button" className="button button-secondary" onClick={() => router.push(`/clients/${clientId}/content`)}>Cancel</button>
        <button type="submit" className="button button-primary" disabled={isSaving}>{isSaving ? "Saving..." : contentId ? "Save changes" : "Create content item"}</button>
      </div>
    </form>
  );
}