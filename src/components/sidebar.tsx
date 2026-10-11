"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: "grid", activePath: "/" },
  { label: "Clients", href: "/clients", icon: "users", activePath: "/clients" },
  { label: "Brand Brain", href: "/clients?destination=brand-brain", icon: "spark", activePath: "/brand-brain" },
  { label: "Strategy", href: "/clients?destination=strategy", icon: "compass", activePath: "/strategy" },
  { label: "Calendar", href: "/clients?destination=calendar", icon: "calendar", activePath: "/calendar" },
  { label: "Content Studio", href: "/clients?destination=content-studio", icon: "pen", activePath: "/content-studio" },
  { label: "QA", href: null, icon: "check", activePath: null },
  { label: "Feedback & Revisions", href: null, icon: "message", activePath: null },
  { label: "Settings", href: null, icon: "settings", activePath: null },
];

function NavigationIcon({ name }: { name: string }) {
  return <span aria-hidden="true" className={`nav-icon nav-icon-${name}`} />;
}

export function Sidebar({ activePath }: { activePath: string }) {
  const pathname = usePathname();
  const currentPath = pathname || activePath;

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
          const activeFeature = navigation.some((candidate) => candidate.activePath && candidate.activePath !== "/" && candidate.activePath !== "/clients" && currentPath.endsWith(candidate.activePath));
          const active = item.activePath === "/"
            ? currentPath === "/" || currentPath === "/dashboard"
            : item.activePath === "/clients"
              ? !activeFeature && (currentPath === "/clients" || currentPath === "/clients/new" || /^\/clients\/[^/]+$/.test(currentPath))
              : Boolean(item.activePath && currentPath.endsWith(item.activePath));
          const className = `nav-item${active ? " nav-item-active" : ""}`;

          if (!item.href) {
            return (
              <button key={item.label} type="button" className={`${className} nav-item-disabled`} disabled aria-disabled="true" title={`${item.label} is not available yet`}>
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