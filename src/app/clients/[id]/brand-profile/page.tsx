import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandProfileForm } from "@/components/brand-profile-form";
import { Sidebar } from "@/components/sidebar";
import { getClientById } from "@/lib/clients";

export default async function BrandProfilePage({ params }: PageProps<"/clients/[id]/brand-profile">) {
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
            <h1>{profile ? "Edit Brand Profile" : "Create Brand Profile"}</h1>
            <p className="page-description">Capture the central brand context that will guide future work.</p>
          </div>
        </header>
        <section className="form-panel" aria-labelledby="brand-profile-form-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Brand foundation</p>
              <h2 id="brand-profile-form-title">Brand Profile details</h2>
            </div>
          </div>
          <BrandProfileForm
            clientId={client.id}
            initialValues={{
              brandName: profile?.brandName ?? client.name,
              description: profile?.description ?? "",
              personality: profile?.personality ?? "",
              voice: profile?.voice ?? "",
              targetAudience: profile?.targetAudience ?? "",
              valueProposition: profile?.valueProposition ?? "",
            }}
          />
        </section>
      </main>
    </div>
  );
}