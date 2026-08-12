import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import authorsIllustration from "../assets/authors-illustration.png";
import papersIllustration from "../assets/papers-illustration.png";
import collaborationIllustration from "../assets/collaboration-illustration.png";

const EXAMPLES = [
  { label: "Aisha Chen", to: "/authors?q=Aisha%20Chen" },
  { label: "Cryptography", to: "/topics" },
  { label: "Distributed Systems", to: "/topics" },
];

function StatCard({ value, label, loading }) {
  return (
    <div className="rounded-xl border border-gold/15 bg-panel px-5 py-4 text-center">
      <p className="font-display text-2xl font-medium text-goldBright">
        {loading ? <span className="animate-softPulse">—</span> : value}
      </p>
      <p className="text-xs text-muted font-mono uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}

function FeatureCard({ image, alt, title, description, cta, to }) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-gold/15 bg-panel p-6 flex flex-col hover:border-gold/40 hover:bg-panel2 transition"
    >
      <div className="h-36 flex items-center justify-center mb-5">
        <img src={image} alt={alt} className="max-h-full max-w-full object-contain" />
      </div>
      <h3 className="font-display text-lg font-medium mb-1.5">{title}</h3>
      <p className="text-sm text-muted leading-relaxed flex-1">{description}</p>
      <span className="text-xs font-mono uppercase tracking-wide text-gold group-hover:text-goldBright mt-4">
        {cta}
      </span>
    </Link>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    api
      .getStats()
      .then(setStats)
      .catch(() => setStatsError(true));
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/authors?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="grid md:grid-cols-2 gap-10 items-center pt-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-gold mb-4">
            CognoDB · Graph Research Explorer
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-medium leading-tight mb-4">
            Explore the connections behind research.
          </h2>
          <p className="text-sm text-muted leading-relaxed mb-7 max-w-md">
            Discover researchers, papers, topics, citations, and collaboration
            opportunities through an interactive research graph.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search researchers, papers or topics…"
              className="flex-1 rounded-full border border-gold/20 bg-panel px-4 py-2.5 text-sm text-ivory placeholder:text-muted outline-none focus:border-gold focus:ring-1 focus:ring-gold/40"
            />
            <button
              type="submit"
              className="font-mono text-xs uppercase tracking-wide rounded-full bg-gold text-bg font-medium px-6 py-2.5 hover:bg-goldBright transition"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-2 mt-4">
            {EXAMPLES.map((ex) => (
              <Link
                key={ex.label}
                to={ex.to}
                className="text-xs font-mono text-muted border border-gold/15 rounded-full px-3.5 py-1.5 hover:border-gold/40 hover:text-goldBright transition"
              >
                {ex.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-30"
              style={{ background: "radial-gradient(circle, #C9A227, transparent 70%)" }}
              aria-hidden="true"
            />
            <img
              src={authorsIllustration}
              alt="Researcher exploring academic connections"
              className="relative max-h-72 w-auto object-contain"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          value={statsError ? "—" : `${stats?.authors ?? ""}`}
          label="Researchers"
          loading={!stats && !statsError}
        />
        <StatCard
          value={statsError ? "—" : `${stats?.papers ?? ""}`}
          label="Papers"
          loading={!stats && !statsError}
        />
        <StatCard
          value={statsError ? "—" : `${stats?.topics ?? ""}`}
          label="Topics"
          loading={!stats && !statsError}
        />
        <StatCard
          value={statsError ? "—" : `${stats?.relationships ?? ""}`}
          label="Connections"
          loading={!stats && !statsError}
        />
      </section>

      {/* Feature cards */}
      <section className="grid md:grid-cols-3 gap-5">
        <FeatureCard
          image={authorsIllustration}
          alt="Researcher exploring academic connections"
          title="Explore Researchers"
          description="Discover researchers, their publications, expertise, and collaboration networks."
          cta="Explore Authors →"
          to="/authors"
        />
        <FeatureCard
          image={papersIllustration}
          alt="Research paper and citation exploration"
          title="Explore Papers"
          description="Trace authors, topics, citations, and related research through the graph."
          cta="Explore Papers →"
          to="/papers"
        />
        <FeatureCard
          image={collaborationIllustration}
          alt="Research collaboration network"
          title="Find Collaboration Paths"
          description="Discover how researchers are connected through shared publications and research relationships."
          cta="Find a Path →"
          to="/path"
        />
      </section>

      {/* Why graph */}
      <section className="rounded-2xl border border-gold/15 bg-panel p-8">
        <h3 className="font-display text-xl font-medium mb-4">Why a Graph Database?</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3 text-sm text-muted leading-relaxed">
            <p>
              In this dataset, researchers author papers, papers cite other papers,
              and papers cover research topics. Two researchers are often connected
              only indirectly — through a shared paper, a shared topic, or a chain
              of co-authorships several hops apart.
            </p>
            <p>
              A graph database stores those relationships as first-class citizens,
              so multi-hop questions — like the shortest collaboration path between
              two researchers, or a paper's citation neighborhood — are natural
              traversals instead of repeated recursive joins.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="flex flex-wrap items-center justify-center gap-3 max-w-xs">
              <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-goldBright/10 border border-goldBright/30 text-goldBright">
                Author
              </span>
              <span className="text-gold/40 text-xs">AUTHORED →</span>
              <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-teal/10 border border-teal/30 text-teal">
                Paper
              </span>
              <span className="text-gold/40 text-xs">ABOUT →</span>
              <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-panel2 border border-gold/20 text-ivory">
                Topic
              </span>
              <span className="text-gold/40 text-xs">CITES →</span>
              <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-teal/10 border border-teal/30 text-teal">
                Paper
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
