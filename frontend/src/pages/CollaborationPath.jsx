import { useState } from "react";
import { api, ApiError } from "../services/api";
import { Loading, EmptyState, ErrorState } from "../components/StateViews";

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
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-2">{label}</p>
      {value ? (
        <div className="flex items-center justify-between rounded-lg border border-gold/25 bg-gold/10 px-3.5 py-2.5">
          <span className="text-sm font-display font-medium">{value.name}</span>
          <button onClick={() => onSelect(null)} className="text-xs font-mono text-gold hover:text-goldBright">
            change
          </button>
        </div>
      ) : (
        <>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a researcher…"
              className="flex-1 rounded-lg border border-gold/20 bg-panel px-3.5 py-2.5 text-sm text-ivory placeholder:text-muted outline-none focus:border-gold focus:ring-1 focus:ring-gold/40"
            />
            <button
              type="submit"
              className="text-xs font-mono uppercase px-3.5 py-2.5 rounded-lg bg-panel2 text-muted hover:text-ivory border border-gold/15"
            >
              Go
            </button>
          </form>
          {results && results.length > 0 && (
            <ul className="mt-2 max-h-40 overflow-auto border border-gold/15 rounded-lg bg-panel divide-y divide-gold/10">
              {results.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => onSelect(a)}
                    className="w-full text-left px-3.5 py-2.5 text-sm hover:bg-gold/10 hover:text-goldBright transition-colors"
                  >
                    {a.name}{" "}
                    <span className="text-muted text-xs font-mono">— {a.institution}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {results && results.length === 0 && (
            <p className="text-xs text-muted mt-2 font-mono">No matches.</p>
          )}
        </>
      )}
    </div>
  );
}

function ConstellationResult({ path }) {
  const hops = path.hops;
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.1em] text-gold mb-6">
        Shortest path &nbsp;·&nbsp;{" "}
        <span className="text-goldBright text-sm normal-case">
          {hops} hop{hops === 1 ? "" : "s"}
        </span>
      </p>
      <div className="flex items-start overflow-x-auto pb-4">
        {path.nodes.map((n, i) => {
          const isAuthor = n.label === "Author";
          return (
            <div key={i} className="flex items-start">
              <div className="flex flex-col items-center min-w-[130px] flex-shrink-0">
                <div className="font-mono text-[10px] text-muted mb-1.5 tracking-wide">
                  HOP {String(i).padStart(2, "0")}
                </div>
                <div
                  className={`animate-twinkle mb-2.5 ${
                    isAuthor ? "text-goldBright text-2xl" : "text-teal text-lg"
                  }`}
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  {isAuthor ? "✦" : "◆"}
                </div>
                <div
                  className={
                    isAuthor
                      ? "font-display text-sm font-medium text-center max-w-[150px]"
                      : "font-sans text-xs italic text-muted text-center max-w-[150px]"
                  }
                >
                  {n.name}
                </div>
              </div>
              {i < path.nodes.length - 1 && (
                <div className="flex-1 min-w-[40px] h-6 mt-6 relative">
                  <svg viewBox="0 0 100 4" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <line
                      x1="0"
                      y1="2"
                      x2="100"
                      y2="2"
                      className="stroke-gold animate-draw"
                      style={{ strokeWidth: 1.5, strokeDasharray: 100, strokeDashoffset: 100, animationDelay: `${i * 0.15 + 0.1}s` }}
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
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

  return (
    <div className="space-y-9">
      <div>
        <h2 className="font-display text-xl font-medium mb-1.5">Collaboration path</h2>
        <p className="text-sm text-muted mb-6 max-w-2xl">
          Chart the shortest chain of co-authorship connecting two researchers — a
          multi-hop traversal that would need repeated recursive self-joins in SQL.
        </p>

        <div className="bg-panel border border-gold/15 rounded-2xl p-7">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <AuthorPicker label="From" value={authorA} onSelect={setAuthorA} />
            <span className="hidden sm:block pt-9 text-gold/50">✦→</span>
            <AuthorPicker label="To" value={authorB} onSelect={setAuthorB} />
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={findPath}
              disabled={!authorA || !authorB}
              className="font-mono text-xs uppercase tracking-[0.1em] rounded-full bg-gold text-bg font-medium px-7 py-3 hover:bg-goldBright transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Chart Path
            </button>
          </div>
        </div>
      </div>

      {status === "loading" && <Loading label="Charting the network…" />}
      {status === "error" && <ErrorState message={errorMsg} onRetry={findPath} />}

      {path && path.connected === false && (
        <EmptyState
          title="No path found"
          hint="These two researchers aren't linked by co-authorship within 10 hops."
        />
      )}

      {path && path.connected && <ConstellationResult path={path} />}

      {!path && status === "idle" && (
        <div className="py-14 text-center">
          <p className="text-gold/25 text-lg tracking-[0.5em] mb-4">✦ ✦ ✦</p>
          <p className="text-muted text-sm max-w-sm mx-auto">
            Pick two researchers above and chart the shortest line of co-authorship
            between them.
          </p>
        </div>
      )}
    </div>
  );
}
