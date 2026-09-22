import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentItemForm } from "@/components/content-item-form";
import { Sidebar } from "@/components/sidebar";
import { getClientById } from "@/lib/clients";
import { getContentItemById } from "@/lib/content-items";

export default async function EditContentItemPage({ params }: { params: Promise<{ id: string; contentId: string }> }) {
  const { id, contentId } = await params;
  const [client, item] = await Promise.all([getClientById(id), getContentItemById(contentId)]);
  if (!client || !item || item.clientId !== id) notFound();

  return (
    <div className="app-shell">
      <Sidebar activePath="/clients" />
      <main className="main-content">
        <header className="page-header page-header-stacked">
          <Link className="back-link" href={`/clients/${id}/content`}>&lt;- Back to Content Planning</Link>
          <p className="eyebrow">Content Planning</p>
          <h1>Edit Content Item</h1>
          <p className="page-description">Update the planning details for {item.title}.</p>
        </header>
        <section className="form-panel" aria-labelledby="edit-content-item-title">
          <div className="section-heading"><div><p className="eyebrow">Planning details</p><h2 id="edit-content-item-title">{item.title}</h2></div></div>
          <ContentItemForm
            clientId={id}
            contentId={item.id}
            initialValues={{
              ...item,
              description: item.description ?? "",
              contentPillar: item.contentPillar ?? "",
              objective: item.objective ?? "",
              targetAudience: item.targetAudience ?? "",
              hook: item.hook ?? "",
              callToAction: item.callToAction ?? "",
              notes: item.notes ?? "",
              scheduledAt: item.scheduledAt?.toISOString() ?? "",
            }}
          />
        </section>
      </main>
    </div>
  );
}