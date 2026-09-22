"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type BrandProfileValues = {
  brandName: string;
  description: string;
  personality: string;
  voice: string;
  targetAudience: string;
  valueProposition: string;
  offers: string;
  contentPillars: string;
  goals: string;
  platforms: string;
  brandRules: string;
};

export function BrandProfileForm({ clientId, initialValues }: { clientId: string; initialValues: BrandProfileValues }) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  function updateValue(field: keyof BrandProfileValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!values.brandName.trim()) {
      setError("Brand name is required.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/clients/${clientId}/brand-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "The Brand Profile could not be saved. Please try again.");
        return;
      }

      router.push(`/clients/${clientId}`);
      router.refresh();
    } catch {
      setError("The Brand Profile could not be saved right now. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="client-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="form-field form-field-wide">
          <span>Brand Name <b>*</b></span>
          <input value={values.brandName} onChange={(event) => updateValue("brandName", event.target.value)} required placeholder="e.g. Northstar Coffee" />
        </label>
        <label className="form-field form-field-wide">
          <span>Description</span>
          <textarea value={values.description} onChange={(event) => updateValue("description", event.target.value)} rows={4} placeholder="What does this brand do?" />
        </label>
        <label className="form-field">
          <span>Personality</span>
          <textarea value={values.personality} onChange={(event) => updateValue("personality", event.target.value)} rows={4} placeholder="e.g. Warm, curious, confident" />
        </label>
        <label className="form-field">
          <span>Voice</span>
          <textarea value={values.voice} onChange={(event) => updateValue("voice", event.target.value)} rows={4} placeholder="How should the brand sound?" />
        </label>
        <label className="form-field">
          <span>Target Audience</span>
          <textarea value={values.targetAudience} onChange={(event) => updateValue("targetAudience", event.target.value)} rows={4} placeholder="Who is the brand speaking to?" />
        </label>
        <label className="form-field form-field-wide">
          <span>Value Proposition</span>
          <textarea value={values.valueProposition} onChange={(event) => updateValue("valueProposition", event.target.value)} rows={4} placeholder="Why should customers choose this brand?" />
        </label>
        <label className="form-field form-field-wide">
          <span>Offers &amp; Services</span>
          <textarea value={values.offers} onChange={(event) => updateValue("offers", event.target.value)} rows={4} placeholder="What products, services, or offers does this brand provide?" />
        </label>
        <label className="form-field form-field-wide">
          <span>Content Pillars</span>
          <textarea value={values.contentPillars} onChange={(event) => updateValue("contentPillars", event.target.value)} rows={4} placeholder="What recurring topics or themes should the brand consistently create content about?" />
        </label>
        <label className="form-field form-field-wide">
          <span>Goals &amp; KPIs</span>
          <textarea value={values.goals} onChange={(event) => updateValue("goals", event.target.value)} rows={4} placeholder="What does the brand want social media to achieve?" />
        </label>
        <label className="form-field form-field-wide">
          <span>Platforms</span>
          <textarea value={values.platforms} onChange={(event) => updateValue("platforms", event.target.value)} rows={4} placeholder="Which social platforms does the brand use or plan to use?" />
        </label>
        <label className="form-field form-field-wide">
          <span>Brand Rules &amp; Restrictions</span>
          <textarea value={values.brandRules} onChange={(event) => updateValue("brandRules", event.target.value)} rows={4} placeholder="What must the brand avoid, follow, or consistently maintain?" />
        </label>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-actions">
        <button type="button" className="button button-secondary" onClick={() => router.push(`/clients/${clientId}`)}>Cancel</button>
        <button type="submit" className="button button-primary" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Brand Profile"}
        </button>
      </div>
    </form>
  );
}