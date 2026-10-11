import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentCalendar } from "@/components/content-calendar";
import { Sidebar } from "@/components/sidebar";
import { getClientById } from "@/lib/clients";
import { getContentItemsByClient } from "@/lib/content-items";

export default async function CalendarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClientById(id);
  if (!client) notFound();

  const items = await getContentItemsByClient(id);
  const calendarItems = items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    platform: item.platform,
    contentType: item.contentType,
    status: item.status,
    scheduledAt: item.scheduledAt?.toISOString() ?? "",
  }));

  return (
    <div className="app-shell">
      <Sidebar activePath="/clients" />
      <main className="main-content">
        <header className="page-header">
          <div>
            <Link className="back-link" href={`/clients/${id}`}>&lt;- Back to {client.name}</Link>
            <p className="eyebrow">{client.name}</p>
            <h1>Calendar</h1>
            <p className="page-description">View and schedule the client&apos;s existing content items.</p>
          </div>
          <div className="section-heading-actions">
            <Link className="button button-secondary" href={`/clients/${id}/content`}>Content Planning</Link>
            <Link className="button button-primary" href={`/clients/${id}/content/new`}>Create Content Item</Link>
          </div>
        </header>

        {items.length === 0 ? (
          <section className="calendar-empty-state" aria-labelledby="calendar-empty-title">
            <div className="empty-state-icon" aria-hidden="true">+</div>
            <h2 id="calendar-empty-title">No content items yet</h2>
            <p>Create a content item to start building this client&apos;s calendar.</p>
            <Link className="button button-primary" href={`/clients/${id}/content/new`}>Create Content Item</Link>
          </section>
        ) : (
          <ContentCalendar clientId={id} items={calendarItems} />
        )}
      </main>
    </div>
  );
}
