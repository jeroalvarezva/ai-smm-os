import Link from "next/link";

const navigation = [
  { label: "Dashboard", href: "/", icon: "grid" },
  { label: "Clients", href: "/clients", icon: "users" },
  { label: "Brand Brain", href: "#", icon: "spark" },
  { label: "Strategy", href: "#", icon: "compass" },
  { label: "Calendar", href: "#", icon: "calendar" },
  { label: "Content Studio", href: "#", icon: "pen" },
  { label: "QA", href: "#", icon: "check" },
  { label: "Feedback & Revisions", href: "#", icon: "message" },
  { label: "Settings", href: "#", icon: "settings" },
];

function NavigationIcon({ name }: { name: string }) {
  return <span aria-hidden="true" className={`nav-icon nav-icon-${name}`} />;
}

export function Sidebar({ activePath }: { activePath: string }) {
  return (
    <aside className="sidebar">
      <div className="brand-lockup">
        <div className="brand-mark">AI</div>
        <div>
          <p className="brand-name">AI SMM OS</p>
          <p className="brand-caption">Operations workspace</p>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        <p className="nav-heading">Workspace</p>
        {navigation.map((item) => {
          const active = item.href === activePath;
          const className = `nav-item${active ? " nav-item-active" : ""}`;

          if (item.href === "#") {
            return (
              <button key={item.label} type="button" className={className}>
                <NavigationIcon name={item.icon} />
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link key={item.label} href={item.href} className={className} aria-current={active ? "page" : undefined}>
              <NavigationIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="workspace-avatar">A</div>
        <div>
          <p className="workspace-name">Your workspace</p>
          <p className="workspace-status">Foundation mode</p>
        </div>
        <span className="status-dot" aria-label="Workspace online" />
      </div>
    </aside>
  );
}