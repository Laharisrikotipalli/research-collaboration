import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ForceGraph2D from "react-force-graph-2d";
import { api, ApiError } from "../services/api";
import { Loading, EmptyState, ErrorState } from "../components/StateViews";

function StatBox({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-navy-800/60 px-4 py-3 text-center">
      <p className="text-xl font-serif font-semibold text-gold-400">{value}</p>
      <p className="text-xs text-inkMuted mt-0.5">{label}</p>
    </div>
  );
}

function buildGraphData(author, network) {
  if (!author || !network) return { nodes: [], links: [] };
  const nodes = [{ id: author.id, name: author.name, kind: "self" }];
  const links = [];
  for (const p of network.papers) {
    nodes.push({ id: `paper-${p.id}`, name: p.title, kind: "paper" });
    links.push({ source: author.id, target: `paper-${p.id}` });
  }
  for (const c of network.co_authors) {
    nodes.push({ id: c.id, name: c.name, kind: "coauthor" });
    links.push({ source: author.id, target: c.id });
  }
  return { nodes, links };
}

export default function AuthorDetail() {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [network, setNetwork] = useState(null);
  const [potential, setPotential] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [showGraph, setShowGraph] = useState(false);

  function load() {
    setStatus("loading");
    Promise.all([api.getAuthor(id), api.getAuthorNetwork(id), api.getPotentialCollaborators(id)])
      .then(([a, net, pot]) => {
        setAuthor(a);
        setNetwork(net);
        setPotential(pot);
        setStatus("idle");
      })
      .catch((err) => {
        setErrorMsg(err instanceof ApiError ? err.message : "Something went wrong.");
        setStatus("error");
      });
  }

  useEffect(load, [id]);

  const totalCitations = useMemo(
    () => (network ? network.papers.reduce((sum, p) => sum + (p.citation_count || 0), 0) : 0),
    [network]
  );

  const graphData = useMemo(() => buildGraphData(author, network), [author, network]);

  if (status === "loading") return <Loading label="Loading researcher…" />;
  if (status === "error") return <ErrorState message={errorMsg} onRetry={load} />;
  if (!author) return <EmptyState title="Researcher not found" />;

  return (
    <div className="space-y-10">
      <div>
        <Link to="/authors" className="text-sm text-gold-400 hover:underline">
          ← Back to Researchers
        </Link>
        <h2 className="font-serif text-2xl font-semibold text-ink mt-3">{author.name}</h2>
        <p className="text-sm text-inkMuted mt-1">
          {author.institution} · h-index {author.h_index}
        </p>

        <div className="flex flex-wrap gap-3 mt-5">
          <button
            onClick={() => setShowGraph((v) => !v)}
            className="rounded-full bg-gold-500 text-navy-950 text-sm font-semibold px-5 py-2 hover:bg-gold-400 transition"
          >
            {showGraph ? "Hide Network" : "Explore Network"}
          </button>
          <Link
            to="/path"
            className="rounded-full border border-white/15 text-ink text-sm font-medium px-5 py-2 hover:bg-white/5 transition"
          >
            Find Collaboration Path
          </Link>
        </div>
      </div>

      {network && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox label="Papers" value={network.papers.length} />
          <StatBox label="Citations" value={totalCitations} />
          <StatBox label="Co-authors" value={network.co_authors.length} />
          <StatBox label="Topics" value={network.topics.length} />
        </div>
      )}

      {showGraph && (
        <section>
          <h3 className="text-xs font-semibold text-inkMuted uppercase tracking-widest mb-3">
            Research Network
          </h3>
          <div className="rounded-xl border border-white/10 bg-navy-900 overflow-hidden">
            <ForceGraph2D
              graphData={graphData}
              height={360}
              backgroundColor="#0b1120"
              nodeLabel="name"
              nodeColor={(n) =>
                n.kind === "self" ? "#e8b84b" : n.kind === "paper" ? "#5eead4" : "#93a0bd"
              }
              linkColor={() => "rgba(148,163,184,0.35)"}
              nodeRelSize={5}
            />
          </div>
        </section>
      )}

      {network && (
        <section>
          <h3 className="text-xs font-semibold text-inkMuted uppercase tracking-widest mb-3">
            Papers
          </h3>
          {network.papers.length === 0 ? (
            <EmptyState title="No papers found" />
          ) : (
            <ul className="grid sm:grid-cols-2 gap-3">
              {network.papers.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/papers/${encodeURIComponent(p.id)}`}
                    className="block rounded-lg border border-white/10 bg-navy-800/60 p-4 text-sm hover:border-gold-500/40 transition"
                  >
                    <p className="font-medium text-ink">{p.title}</p>
                    <p className="text-inkMuted text-xs mt-1">
                      {p.year} · {p.citation_count} citations
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {network && (
        <section>
          <h3 className="text-xs font-semibold text-inkMuted uppercase tracking-widest mb-3">
            Research Topics
          </h3>
          {network.topics.length === 0 ? (
            <EmptyState title="No topics found" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {network.topics.map((t) => (
                <span
                  key={t.id}
                  className="text-xs bg-gold-soft text-gold-400 border border-gold-500/20 px-3 py-1 rounded-full font-medium"
                >
                  {t.name}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {network && (
        <section>
          <h3 className="text-xs font-semibold text-inkMuted uppercase tracking-widest mb-3">
            Co-authors
          </h3>
          {network.co_authors.length === 0 ? (
            <EmptyState title="No co-authors yet" />
          ) : (
            <ul className="grid sm:grid-cols-2 gap-3">
              {network.co_authors.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/authors/${encodeURIComponent(c.id)}`}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-navy-800/60 p-4 text-sm hover:border-gold-500/40 transition"
                  >
                    <div>
                      <p className="font-medium text-ink">{c.name}</p>
                      <p className="text-inkMuted text-xs">{c.institution}</p>
                    </div>
                    <span className="text-xs text-gold-400 font-medium">
                      {c.shared_papers} shared
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section>
        <h3 className="text-xs font-semibold text-inkMuted uppercase tracking-widest mb-1">
          Potential Collaborators
        </h3>
        <p className="text-xs text-inkMuted mb-3">
          Same research topics, never co-authored — a graph-native discovery query.
        </p>
        {!potential || potential.length === 0 ? (
          <EmptyState title="No potential collaborators found" />
        ) : (
          <ul className="grid sm:grid-cols-2 gap-3">
            {potential.slice(0, 6).map((p) => (
              <li key={p.id}>
                <Link
                  to={`/authors/${encodeURIComponent(p.id)}`}
                  className="block rounded-lg border border-dashed border-gold-500/30 p-4 text-sm hover:border-gold-500/60 transition"
                >
                  <p className="font-medium text-ink">{p.name}</p>
                  <p className="text-inkMuted text-xs">{p.shared_topics.join(", ")}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
