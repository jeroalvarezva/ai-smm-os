import Link from "next/link";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { getClientById } from "@/lib/clients";

function formatStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function ClientDetailPage({ params }: PageProps<"/clients/[id]">) {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) {
    notFound();
  }

  return (
    <div className="app-shell">
      <Sidebar activePath="/clients" />
      <main className="main-content">
        <header className="page-header page-header-stacked">
          <div>
            <Link className="back-link" href="/clients">&lt;- Back to clients</Link>
            <p className="eyebrow">Client profile</p>
            <h1>{client.name}</h1>
            <p className="page-description">Basic information for this client.</p>
          </div>
        </header>

        <section className="detail-panel" aria-labelledby="client-details-title">
          <div className="detail-heading">
            <div className="client-avatar client-avatar-large">{client.name.charAt(0).toUpperCase()}</div>
            <div>
              <p className="eyebrow">Client details</p>
              <h2 id="client-details-title">{client.name}</h2>
            </div>
            <span className={`client-status client-status-${client.status.toLowerCase()}`}>{formatStatus(client.status)}</span>
          </div>
          <dl className="detail-grid">
            <div><dt>Industry</dt><dd>{client.industry || "Not specified"}</dd></div>
            <div><dt>Website</dt><dd>{client.website ? <a href={client.website} target="_blank" rel="noreferrer">{client.website}</a> : "Not specified"}</dd></div>
            <div className="detail-field-wide"><dt>Description</dt><dd>{client.description || "No description added."}</dd></div>
          </dl>
        </section>

        <section className="brand-profile-panel" aria-labelledby="brand-profile-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Central brand context</p>
              <h2 id="brand-profile-title">Brand Profile</h2>
            </div>
            {client.brandProfile && <Link className="button button-secondary" href={`/clients/${client.id}/brand-profile`}>Edit Brand Profile</Link>}
          </div>

          {client.brandProfile ? (
            <div className="brand-profile-summary">
              <div className="brand-profile-summary-heading">
                <div>
                  <p className="eyebrow">Brand name</p>
                  <h3>{client.brandProfile.brandName}</h3>
                </div>
              </div>
              <dl className="detail-grid brand-profile-grid">
                <div><dt>Description</dt><dd>{client.brandProfile.description || "Not specified"}</dd></div>
                <div><dt>Personality</dt><dd>{client.brandProfile.personality || "Not specified"}</dd></div>
                <div><dt>Voice</dt><dd>{client.brandProfile.voice || "Not specified"}</dd></div>
                <div><dt>Target audience</dt><dd>{client.brandProfile.targetAudience || "Not specified"}</dd></div>
                <div className="detail-field-wide"><dt>Value proposition</dt><dd>{client.brandProfile.valueProposition || "Not specified"}</dd></div>
              </dl>
            </div>
          ) : (
            <div className="brand-profile-empty">
              <div className="empty-state-icon" aria-hidden="true">+</div>
              <div>
                <h3>No Brand Profile yet</h3>
                <p>Create a central place for this client&apos;s brand context.</p>
              </div>
              <Link className="button button-primary" href={`/clients/${client.id}/brand-profile`}>Create Brand Profile</Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}