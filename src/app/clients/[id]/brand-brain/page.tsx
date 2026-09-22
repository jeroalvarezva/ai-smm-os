import Link from "next/link";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { getClientById } from "@/lib/clients";

function formatField(value?: string | null) {
  return value && value.trim() ? value : "Not defined yet";
}

export default async function BrandBrainPage({ params }: PageProps<"/clients/[id]/brand-brain">) {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) {
    notFound();
  }

  const profile = client.brandProfile;

  return (
    <div className="app-shell">
      <Sidebar activePath="/clients" />
      <main className="main-content">
        <header className="page-header page-header-stacked">
          <div>
            <Link className="back-link" href={`/clients/${client.id}`}>&lt;- Back to {client.name}</Link>
            <p className="eyebrow">{client.name}</p>
            <h1>Brand Brain</h1>
            <p className="page-description">This is the central source of truth for the client&apos;s brand information.</p>
          </div>
        </header>

        {profile ? (
          <>
            <section className="detail-panel" aria-labelledby="brand-brain-title">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Brand foundation</p>
                  <h2 id="brand-brain-title">Brand Foundation</h2>
                </div>
                <Link className="button button-secondary" href={`/clients/${client.id}/brand-profile`}>Edit Brand Profile</Link>
              </div>

              <dl className="detail-grid brand-profile-grid">
                <div><dt>Brand Name</dt><dd>{formatField(profile.brandName)}</dd></div>
                <div className="detail-field-wide"><dt>Description</dt><dd>{formatField(profile.description)}</dd></div>
                <div><dt>Personality</dt><dd>{formatField(profile.personality)}</dd></div>
                <div><dt>Voice</dt><dd>{formatField(profile.voice)}</dd></div>
                <div className="detail-field-wide"><dt>Value Proposition</dt><dd>{formatField(profile.valueProposition)}</dd></div>
              </dl>
            </section>

            <section className="detail-panel" aria-labelledby="brand-audience-title">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Audience</p>
                  <h2 id="brand-audience-title">Audience</h2>
                </div>
              </div>

              <dl className="detail-grid brand-profile-grid">
                <div className="detail-field-wide"><dt>Target Audience</dt><dd>{formatField(profile.targetAudience)}</dd></div>
              </dl>
            </section>

            <section className="detail-panel" aria-labelledby="brand-offers-title">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Offers &amp; services</p>
                  <h2 id="brand-offers-title">Offers &amp; Services</h2>
                </div>
              </div>

              <dl className="detail-grid brand-profile-grid">
                <div className="detail-field-wide"><dt>Offers &amp; Services</dt><dd>{formatField(profile.offers)}</dd></div>
              </dl>
            </section>

            <section className="detail-panel" aria-labelledby="brand-content-title">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Content strategy foundation</p>
                  <h2 id="brand-content-title">Content Strategy Foundation</h2>
                </div>
              </div>

              <dl className="detail-grid brand-profile-grid">
                <div className="detail-field-wide"><dt>Content Pillars</dt><dd>{formatField(profile.contentPillars)}</dd></div>
                <div className="detail-field-wide"><dt>Goals &amp; KPIs</dt><dd>{formatField(profile.goals)}</dd></div>
                <div className="detail-field-wide"><dt>Platforms</dt><dd>{formatField(profile.platforms)}</dd></div>
              </dl>
            </section>

            <section className="detail-panel" aria-labelledby="brand-rules-title">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Brand rules</p>
                  <h2 id="brand-rules-title">Brand Rules</h2>
                </div>
              </div>

              <dl className="detail-grid brand-profile-grid">
                <div className="detail-field-wide"><dt>Brand Rules &amp; Restrictions</dt><dd>{formatField(profile.brandRules)}</dd></div>
              </dl>
            </section>
          </>
        ) : (
          <section className="detail-panel" aria-labelledby="brand-brain-empty-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Brand foundation</p>
                <h2 id="brand-brain-empty-title">Brand Foundation</h2>
              </div>
            </div>

            <div className="brand-profile-empty">
              <div className="empty-state-icon" aria-hidden="true">+</div>
              <div>
                <h3>Brand Profile missing</h3>
                <p>The Brand Brain needs a Brand Profile before it can become the central source of truth for this client.</p>
              </div>
              <Link className="button button-primary" href={`/clients/${client.id}/brand-profile`}>Create Brand Profile</Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
