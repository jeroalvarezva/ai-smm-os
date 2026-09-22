import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { listClients } from "@/lib/clients";

function formatStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function ClientsPage() {
  const clients = await listClients();

  return (
    <div className="app-shell">
      <Sidebar activePath="/clients" />
      <main className="main-content">
        <header className="page-header">
          <div>
            <p className="eyebrow">Workspace</p>
            <h1>Clients</h1>
            <p className="page-description">Keep your client relationships organized in one place.</p>
          </div>
          <Link className="button button-primary" href="/clients/new">+ Add client</Link>
        </header>

        <section className="clients-panel" aria-labelledby="clients-list-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Client directory</p>
              <h2 id="clients-list-title">All clients</h2>
            </div>
            <span className="section-note">{clients.length} {clients.length === 1 ? "client" : "clients"}</span>
          </div>

          {clients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" aria-hidden="true">+</div>
              <h3>No clients yet</h3>
              <p>Add your first client to begin building your workspace.</p>
              <Link className="button button-primary" href="/clients/new">Add your first client</Link>
            </div>
          ) : (
            <div className="client-list" role="list">
              {clients.map((client) => (
                <Link className="client-row" href={`/clients/${client.id}`} key={client.id} role="listitem">
                  <div className="client-avatar">{client.name.charAt(0).toUpperCase()}</div>
                  <div className="client-row-main">
                    <h3>{client.name}</h3>
                    <p>{client.industry || "Industry not specified"}</p>
                  </div>
                  <span className={`client-status client-status-${client.status.toLowerCase()}`}>{formatStatus(client.status)}</span>
                  <span className="client-website">{client.website || "No website"}</span>
                  <span className="client-row-arrow" aria-hidden="true">-&gt;</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}