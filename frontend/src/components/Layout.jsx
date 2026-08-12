import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { to: "/", label: "Home", end: true },
  { to: "/authors", label: "Authors" },
  { to: "/papers", label: "Papers" },
  { to: "/topics", label: "Topics" },
  { to: "/path", label: "Collaboration Path" },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-navy-950 font-sans text-ink">
      <header className="border-b border-white/10 bg-navy-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-lg bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400 font-serif font-semibold">
              R
            </span>
            <div>
              <h1 className="font-serif text-lg font-semibold tracking-tight text-ink">
                Research Collaboration Explorer
              </h1>
              <p className="text-xs text-inkMuted">Backed by CognoDB — a graph database</p>
            </div>
          </NavLink>
        </div>
        <nav className="max-w-6xl mx-auto px-6 flex gap-1 pb-3 overflow-x-auto">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  isActive
                    ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                    : "text-inkMuted hover:bg-white/5 hover:text-ink border border-transparent"
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10">
        <Outlet />
      </main>
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-inkMuted">
          Research Collaboration Explorer — powered by CognoDB.
        </div>
      </footer>
    </div>
  );
}
