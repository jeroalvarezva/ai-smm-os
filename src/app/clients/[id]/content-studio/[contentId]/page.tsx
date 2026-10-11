import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentStudioForm } from "@/components/content-studio-form";
import { AIProductionGenerator } from "@/components/ai-production-generator";
import { Sidebar } from "@/components/sidebar";
import { getClientById } from "@/lib/clients";
import { getContentItemById } from "@/lib/content-items";

function label(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase().replaceAll("_", " ");
}

export default async function ContentStudioItemPage({ params }: { params: Promise<{ id: string; contentId: string }> }) {
  const { id, contentId } = await params;
  const [client, item] = await Promise.all([getClientById(id), getContentItemById(contentId)]);
  if (!client || !item || item.clientId !== id) notFound();

  return (
    <div className="app-shell">
      <Sidebar activePath="/clients" />
      <main className="main-content">
        <header className="page-header page-header-stacked">
          <Link className="back-link" href={`/clients/${id}/content-studio`}>&lt;- Back to Content Studio</Link>
          <p className="eyebrow">{client.name} · Content Studio</p>
          <h1>{item.title}</h1>
          <p className="page-description">Work on production details without changing the content plan status.</p>
        </header>
        <section className="detail-panel studio-information" aria-labelledby="studio-information-title">
          <div className="section-heading"><div><p className="eyebrow">Content information</p><h2 id="studio-information-title">Production workspace</h2></div></div>
          <dl className="detail-grid">
            <div><dt>Platform</dt><dd>{label(item.platform)}</dd></div>
            <div><dt>Content type</dt><dd>{label(item.contentType)}</dd></div>
            <div><dt>Status</dt><dd><span className="content-status">{label(item.status)}</span></dd></div>
            <div><dt>Scheduled date</dt><dd>{item.scheduledAt ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(item.scheduledAt) : "Not scheduled"}</dd></div>
          </dl>
        </section>
        <AIProductionGenerator clientId={id} contentId={item.id} />
        <section className="form-panel studio-production-panel" aria-labelledby="production-fields-title">
          <div className="section-heading"><div><p className="eyebrow">Production fields</p><h2 id="production-fields-title">Working draft</h2></div></div>
          <ContentStudioForm clientId={id} contentId={item.id} initialValues={{ hook: item.hook ?? "", caption: item.caption ?? "", script: item.script ?? "", callToAction: item.callToAction ?? "", visualDirection: item.visualDirection ?? "", productionNotes: item.productionNotes ?? "" }} />
        </section>
      </main>
    </div>
  );
}
