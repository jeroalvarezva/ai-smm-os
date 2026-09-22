import { Sidebar } from "@/components/sidebar";

const statusCards = [
  { label: "Active clients", value: "0", detail: "Your client workspace is ready" },
  { label: "Content in progress", value: "0", detail: "Plan and produce from one place" },
  { label: "Upcoming approvals", value: "0", detail: "Nothing waiting for review" },
];

export default function Home() {
  return (
    <div className="app-shell">
      <Sidebar activePath="/" />

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Tuesday, September 22, 2026</p>
            <h1>Good morning, welcome back.</h1>
          </div>
          <div className="topbar-actions">
            <span className="foundation-badge">Foundation</span>
            <button type="button" className="profile-button" aria-label="Open profile menu">A</button>
          </div>
        </header>

        <section className="hero-panel" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="hero-kicker">AI SMM OS</span>
            <h2 id="hero-title">Your social media operations, ready to take shape.</h2>
            <p>
              Start with a clear workspace for clients, brands, strategy, content, and review.
              Everything you need for the next step will live here.
            </p>
          </div>
          <div className="hero-orbit" aria-hidden="true">
            <span className="orbit-ring orbit-ring-one" />
            <span className="orbit-ring orbit-ring-two" />
            <span className="orbit-core">AI</span>
          </div>
        </section>

        <section className="section-block" aria-labelledby="overview-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Workspace overview</p>
              <h2 id="overview-title">A calm place to get organized</h2>
            </div>
            <span className="section-note">No activity yet</span>
          </div>
          <div className="status-grid">
            {statusCards.map((card) => (
              <article className="status-card" key={card.label}>
                <div className="status-card-topline">
                  <span>{card.label}</span>
                  <span className="card-arrow" aria-hidden="true">-&gt;</span>
                </div>
                <strong>{card.value}</strong>
                <p>{card.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="setup-panel" aria-labelledby="setup-title">
          <div className="setup-icon" aria-hidden="true">+</div>
          <div>
            <p className="eyebrow">Next step</p>
            <h2 id="setup-title">Your operating system starts here</h2>
            <p>The foundation is ready. The rest of the workspace will be added one focused step at a time.</p>
          </div>
          <span className="setup-label">Ready</span>
        </section>
      </main>
    </div>
  );
}
