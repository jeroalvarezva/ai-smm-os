import Link from "next/link";
import { ContentItemForm } from "@/components/content-item-form";
import { Sidebar } from "@/components/sidebar";

export default async function NewContentItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="app-shell">
      <Sidebar activePath="/clients" />
      <main className="main-content">
        <header className="page-header page-header-stacked">
          <Link className="back-link" href={`/clients/${id}/content`}>&lt;- Back to Content Planning</Link>
          <p className="eyebrow">Content Planning</p>
          <h1>Create Content Item</h1>
          <p className="page-description">Capture a planned content item for this client.</p>
        </header>
        <section className="form-panel" aria-labelledby="new-content-item-title">
          <div className="section-heading"><div><p className="eyebrow">Planning details</p><h2 id="new-content-item-title">Content item</h2></div></div>
          <ContentItemForm clientId={id} />
        </section>
      </main>
    </div>
  );
}