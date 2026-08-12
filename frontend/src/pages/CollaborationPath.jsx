import { useState } from "react";
import { api, ApiError } from "../services/api";
import { Loading, EmptyState, ErrorState } from "../components/StateViews";
import { ConstellationGraphic } from "../components/Illustrations";

function AuthorPicker({ label, value, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    const rows = await api.searchAuthors(query.trim());
    setResults(rows);
  }

  return (
    <div className="flex-1">
      <p className="text-xs font-semibold text-inkMuted uppercase tracking-wide mb-1.5">
        {label}
      </p>
      {value ? (
        <div className="flex items-center justify-between rounded-lg border border-gold-500/30 bg-gold-soft px-3 py-2.5">
          <span className="text-sm font-medium text-ink">{value.name}</span>
          <button onClick={() => onSelect(null)} className="text-xs text-gold-400 hover:underline">
            change
          </button>
        </div>
      ) : (
        <>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Select researcher…"
              className="flex-1 rounded-lg border border-white/15 bg-navy-800/60 text-ink placeholder:text-inkMuted px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500/40"
            />
            <button
              type="submit"
              className="text-sm px-3 py-2 rounded-lg border border-white/15 text-ink hover:bg-white/5 transition"
            >
              Go
            </button>
          </form>
          {results && results.length > 0 && (
            <ul className="mt-2 max-h-40 overflow-auto border border-white/10 rounded-lg bg-navy-800/80 divide-y divide-white/5">
              {results.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => onSelect(a)}
                    className="w-full text-left px-3 py-2 text-sm text-ink hover:bg-white/5"
                  >
                    {a.name} <span className="text-inkMuted text-xs">— {a.institution}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {results && results.length === 0 && (
            <p className="text-xs text-inkMuted mt-2">No matches.</p>
          )}
        </>
      )}
    </div>
  );
}

export default function CollaborationPath() {
  const [authorA, setAuthorA] = useState(null);
  const [authorB, setAuthorB] = useState(null);
  const [path, setPath] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function findPath() {
    if (!authorA || !authorB) return;
    setStatus("loading");
    setPath(null);
    try {
      const result = await api.getCollaborationPath(authorA.id, authorB.id);
      setPath(result);
      setStatus("idle");
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  const hasResult = status === "idle" && path;

  return (
    <div className="space-y-10">
      <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-ink">
            Discover Hidden Research Connections
          </h2>
          <p className="text-sm text-inkMuted mt-2 max-w-xl leading-relaxed">
            Find how two researchers are connected through publications and
            collaboration relationships — a multi-hop traversal that would need
            repeated recursive self-joins in a relational database.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-start mt-6 max-w-xl">
            <AuthorPicker label="From Researcher" value={authorA} onSelect={setAuthorA} />
            <span className="hidden sm:block pt-9 text-inkMuted">→</span>
            <AuthorPicker label="To Researcher" value={authorB} onSelect={setAuthorB} />
          </div>

          <button
            onClick={findPath}
            disabled={!authorA || !authorB}
            className="mt-5 rounded-full bg-gold-500 text-navy-950 text-sm font-semibold px-5 py-2.5 hover:bg-gold-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Find Collaboration Path
          </button>
        </div>

        {!hasResult && <ConstellationGraphic className="hidden md:block w-56 opacity-90" />}
      </div>

      {status === "loading" && <Loading label="Traversing the graph…" />}
      {status === "error" && <ErrorState message={errorMsg} onRetry={findPath} />}

      {path && path.connected === false && (
        <EmptyState
          title="No connection found"
          hint="These two researchers aren't linked by co-authorship within 10 hops."
        />
      )}

      {hasResult && path.connected && (
        <section>
          <h3 className="text-xs font-semibold text-inkMuted uppercase tracking-widest mb-1">
            Path Found
          </h3>
          <p className="text-sm text-inkMuted mb-4">
            Shortest path: <span className="font-medium text-ink">{path.hops} hops</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {path.nodes.map((n, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className={`text-sm px-3 py-1.5 rounded-full border ${
                    n.label === "Author"
                      ? "bg-gold-500 text-navy-950 border-gold-500 font-semibold"
                      : "bg-navy-800/60 border-white/15 text-inkMuted"
                  }`}
                >
                  {n.name}
                </span>
                {i < path.nodes.length - 1 && <span className="text-inkMuted">→</span>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
