import Link from "next/link";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { getClientById } from "@/lib/clients";
import { getContentItemsByClient } from "@/lib/content-items";

function label(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase().replaceAll("_", " ");
}

function formatStudioDate(value: Date | null) {
  return value ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(value) : "Not scheduled";
}

export default async function ContentStudioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClientById(id);
  if (!client) notFound();
  const items = await getContentItemsByClient(id);

  return (
    <div className="app-shell">
      <Sidebar activePath="/clients" />
      <main className="main-content">
        <header className="page-header">
          <div>
            <Link className="back-link" href={`/clients/${id}`}>&lt;- Back to {client.name}</Link>
            <p className="eyebrow">{client.name}</p>
            <h1>Content Studio</h1>
            <p className="page-description">Develop production details for this client&apos;s existing content items.</p>
          </div>
          <Link className="button button-secondary" href={`/clients/${id}/content`}>Content Planning</Link>
        </header>
        <section className="clients-panel" aria-labelledby="studio-items-title">
          <div className="section-heading"><div><p className="eyebrow">Production queue</p><h2 id="studio-items-title">Content Items</h2></div><span className="section-note">{items.length} {items.length === 1 ? "item" : "items"}</span></div>
          {items.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon" aria-hidden="true">+</div><h3>No content items yet</h3><p>Create an item in Content Planning before opening Content Studio.</p><Link className="button button-primary" href={`/clients/${id}/content/new`}>Create Content Item</Link></div>
          ) : (
            <div className="content-list" role="list">
              <div className="content-list-header" aria-hidden="true"><span>Title</span><span>Platform</span><span>Type</span><span>Status</span><span>Scheduled</span><span>Updated</span></div>
              {items.map((item) => <Link className="content-row studio-content-row" href={`/clients/${id}/content-studio/${item.id}`} key={item.id}><strong>{item.title}</strong><span>{label(item.platform)}</span><span>{label(item.contentType)}</span><span className="content-status">{label(item.status)}</span><span>{formatStudioDate(item.scheduledAt)}</span><span>{formatStudioDate(item.updatedAt)}</span></Link>)}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
