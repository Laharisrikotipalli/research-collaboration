import { NavLink, Outlet } from "react-router-dom";
import Starfield from "./Starfield";

const tabs = [
  { to: "/", label: "Authors", end: true },
  { to: "/papers", label: "Papers" },
  { to: "/topics", label: "Topics" },
  { to: "/path", label: "Path" },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg font-sans text-ivory relative">
      <Starfield />
      <div className="relative z-10">
        <header className="border-b border-gold/15">
          <div className="max-w-4xl mx-auto px-6 pt-7 pb-5 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-goldBright text-lg leading-none">✦</span>
              <div>
                <h1 className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                  Research Collaboration Explorer
                </h1>
              </div>
            </div>
            <nav className="flex gap-6 font-mono text-xs tracking-wide">
              {tabs.map((t) => (
                <NavLink
                  key={t.to}
                  to={t.to}
                  end={t.end}
                  className={({ isActive }) =>
                    `pb-1 border-b transition-colors ${
                      isActive
                        ? "text-goldBright border-gold"
                        : "text-muted border-transparent hover:text-ivory"
                    }`
                  }
                >
                  {t.label.toUpperCase()}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-10">
          <Outlet />
        </main>
        <footer className="max-w-4xl mx-auto px-6 pb-10 font-mono text-[11px] tracking-wide text-muted text-center">
          Backed by CognoDB — a graph database
        </footer>
      </div>
    </div>
  );
}
