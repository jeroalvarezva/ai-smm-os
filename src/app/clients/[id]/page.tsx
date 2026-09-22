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
      </main>
    </div>
  );
}