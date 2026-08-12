import { useState } from "react";
import { api, ApiError } from "../services/api";
import { Loading, EmptyState, ErrorState } from "../components/StateViews";

export default function AuthorExplorer() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState(null);
  const [network, setNetwork] = useState(null);
  const [potential, setPotential] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setStatus("loading");
    setSelected(null);
    try {
      const rows = await api.searchAuthors(query.trim());
      setResults(rows);
      setStatus("idle");
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  async function selectAuthor(author) {
    setSelected(author);
    setNetwork(null);
    setPotential(null);
    setStatus("loading");
    try {
      const [net, pot] = await Promise.all([
        api.getAuthorNetwork(author.id),
        api.getPotentialCollaborators(author.id),
      ]);
      setNetwork(net);
      setPotential(pot);
      setStatus("idle");
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-9">
      <div>
        <h2 className="font-display text-xl font-medium mb-1.5">Find a researcher</h2>
        <p className="text-sm text-muted mb-6">
          Search by name to explore their papers, co-authors, and research topics.
        </p>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Priya Sharma"
            className="flex-1 rounded-full border border-gold/20 bg-panel px-4 py-2.5 text-sm text-ivory placeholder:text-muted outline-none focus:border-gold focus:ring-1 focus:ring-gold/40"
          />
          <button
            type="submit"
            className="font-mono text-xs uppercase tracking-wide rounded-full bg-gold text-bg font-medium px-6 py-2.5 hover:bg-goldBright transition"
          >
            Search
          </button>
        </form>
      </div>

      {status === "loading" && !selected && <Loading label="Searching authors…" />}
      {status === "error" && <ErrorState message={errorMsg} onRetry={() => setStatus("idle")} />}

      {results && results.length === 0 && !selected && (
        <EmptyState title="No authors found" hint="Try a different name or partial spelling." />
      )}

      {results && results.length > 0 && !selected && (
        <ul className="grid sm:grid-cols-2 gap-3">
          {results.map((a) => (
            <li key={a.id}>
              <button
                onClick={() => selectAuthor(a)}
                className="w-full text-left rounded-xl border border-gold/15 bg-panel p-4 hover:border-gold/40 hover:bg-panel2 transition"
              >
                <p className="font-display font-medium">{a.name}</p>
                <p className="text-xs text-muted mt-0.5">{a.institution}</p>
                <p className="text-xs text-gold font-mono mt-1.5">h-index {a.h_index}</p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div className="space-y-7">
          <button onClick={() => setSelected(null)} className="text-xs font-mono text-gold hover:text-goldBright">
            ← Back to results
          </button>

          <div className="rounded-xl border border-gold/15 bg-panel p-6 flex items-start gap-3">
            <span className="text-goldBright text-xl leading-none mt-0.5">✦</span>
            <div>
              <h3 className="font-display text-lg font-medium">{selected.name}</h3>
              <p className="text-sm text-muted">
                {selected.institution} · h-index {selected.h_index}
              </p>
            </div>
          </div>

          {status === "loading" && <Loading label="Loading network…" />}

          {network && (
            <div className="grid md:grid-cols-2 gap-7">
              <section>
                <h4 className="font-mono text-xs uppercase tracking-wide text-muted mb-3">
                  Papers ({network.papers.length})
                </h4>
                {network.papers.length === 0 ? (
                  <EmptyState title="No papers found" />
                ) : (
                  <ul className="space-y-2">
                    {network.papers.map((p) => (
                      <li key={p.id} className="rounded-lg border border-gold/10 bg-panel p-3.5 text-sm">
                        <p className="font-medium">{p.title}</p>
                        <p className="text-muted text-xs mt-1 font-mono">
                          {p.year} · {p.citation_count} citations
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h4 className="font-mono text-xs uppercase tracking-wide text-muted mb-3">
                  Co-authors ({network.co_authors.length})
                </h4>
                {network.co_authors.length === 0 ? (
                  <EmptyState title="No co-authors yet" />
                ) : (
                  <ul className="space-y-2">
                    {network.co_authors.map((c) => (
                      <li
                        key={c.id}
                        className="rounded-lg border border-gold/10 bg-panel p-3.5 text-sm flex justify-between"
                      >
                        <div>
                          <p className="font-medium">{c.name}</p>
                          <p className="text-muted text-xs">{c.institution}</p>
                        </div>
                        <span className="text-xs text-gold font-mono self-center">
                          {c.shared_papers} shared
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="md:col-span-2">
                <h4 className="font-mono text-xs uppercase tracking-wide text-muted mb-3">Research topics</h4>
                <div className="flex flex-wrap gap-2">
                  {network.topics.map((t) => (
                    <span
                      key={t.id}
                      className="text-xs bg-teal/10 border border-teal/25 text-teal px-3 py-1.5 rounded-full font-mono"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </section>

              {potential && potential.length > 0 && (
                <section className="md:col-span-2">
                  <h4 className="font-mono text-xs uppercase tracking-wide text-muted mb-1">
                    Potential collaborators
                  </h4>
                  <p className="text-xs text-muted mb-3">
                    Same research topics, never co-authored — a graph-native discovery query.
                  </p>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {potential.slice(0, 6).map((p) => (
                      <li key={p.id} className="rounded-lg border border-dashed border-gold/25 p-3.5 text-sm">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-muted text-xs">{p.shared_topics.join(", ")}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
