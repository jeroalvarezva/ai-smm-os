import Link from "next/link";
import { ClientForm } from "@/components/client-form";
import { Sidebar } from "@/components/sidebar";

export default function NewClientPage() {
  return (
    <div className="app-shell">
      <Sidebar activePath="/clients" />
      <main className="main-content">
        <header className="page-header page-header-stacked">
          <div>
            <Link className="back-link" href="/clients">&lt;- Back to clients</Link>
            <p className="eyebrow">Client directory</p>
            <h1>Add client</h1>
            <p className="page-description">Create a client record for your workspace.</p>
          </div>
        </header>
        <section className="form-panel" aria-labelledby="new-client-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Basic information</p>
              <h2 id="new-client-title">Client details</h2>
            </div>
          </div>
          <ClientForm />
        </section>
      </main>
    </div>
  );
}