import { useState } from "react";
import { api, ApiError } from "../services/api";
import { Loading, EmptyState, ErrorState } from "../components/StateViews";

export default function PaperExplorer() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [citations, setCitations] = useState(null);
  const [neighborhood, setNeighborhood] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setStatus("loading");
    setSelected(null);
    try {
      const rows = await api.searchPapers(query.trim());
      setResults(rows);
      setStatus("idle");
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  async function selectPaper(paper) {
    setSelected(paper);
    setDetail(null);
    setCitations(null);
    setNeighborhood(null);
    setStatus("loading");
    try {
      const [d, c, n] = await Promise.all([
        api.getPaper(paper.id),
        api.getCitations(paper.id),
        api.getCitationNeighborhood(paper.id),
      ]);
      setDetail(d);
      setCitations(c);
      setNeighborhood(n);
      setStatus("idle");
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-9">
      <div>
        <h2 className="font-display text-xl font-medium mb-1.5">Find a paper</h2>
        <p className="text-sm text-muted mb-6">
          Search by title to see its authors, topics, and citation network.
        </p>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Knowledge Graphs"
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

      {status === "loading" && !selected && <Loading label="Searching papers…" />}
      {status === "error" && <ErrorState message={errorMsg} onRetry={() => setStatus("idle")} />}

      {results && results.length === 0 && !selected && (
        <EmptyState title="No papers found" hint="Try a broader search term." />
      )}

      {results && results.length > 0 && !selected && (
        <ul className="space-y-2">
          {results.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => selectPaper(p)}
                className="w-full text-left rounded-xl border border-gold/15 bg-panel p-4 hover:border-gold/40 hover:bg-panel2 transition"
              >
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-muted mt-1 font-mono">
                  {p.year} · {p.citation_count} citations
                </p>
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

          {status === "loading" && <Loading label="Loading paper details…" />}

          {detail && (
            <>
              <div className="rounded-xl border border-gold/15 bg-panel p-6">
                <div className="flex items-start gap-3">
                  <span className="text-teal text-lg leading-none mt-0.5">◆</span>
                  <div>
                    <h3 className="font-display text-lg font-medium">{detail.title}</h3>
                    <p className="text-sm text-muted mt-1 font-mono">
                      {detail.year} · {detail.citation_count} citations
                    </p>
                  </div>
                </div>
                <p className="text-sm text-ivory/80 mt-4 leading-relaxed">{detail.abstract}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {detail.authors.filter((a) => a.id).map((a) => (
                    <span key={a.id} className="text-xs bg-panel2 border border-gold/15 px-3 py-1.5 rounded-full">
                      {a.name}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {detail.topics.filter((t) => t.id).map((t) => (
                    <span
                      key={t.id}
                      className="text-xs bg-teal/10 border border-teal/25 text-teal px-3 py-1.5 rounded-full font-mono"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>

              {citations && (
                <div className="grid md:grid-cols-2 gap-7">
                  <section>
                    <h4 className="font-mono text-xs uppercase tracking-wide text-muted mb-3">
                      Cites ({citations.cites.length})
                    </h4>
                    {citations.cites.length === 0 ? (
                      <EmptyState title="Doesn't cite any papers in this dataset" />
                    ) : (
                      <ul className="space-y-2">
                        {citations.cites.map((c) => (
                          <li key={c.id} className="rounded-lg border border-gold/10 bg-panel p-3.5 text-sm">
                            {c.title} <span className="text-muted font-mono">({c.year})</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                  <section>
                    <h4 className="font-mono text-xs uppercase tracking-wide text-muted mb-3">
                      Cited by ({citations.cited_by.length})
                    </h4>
                    {citations.cited_by.length === 0 ? (
                      <EmptyState title="Not yet cited in this dataset" />
                    ) : (
                      <ul className="space-y-2">
                        {citations.cited_by.map((c) => (
                          <li key={c.id} className="rounded-lg border border-gold/10 bg-panel p-3.5 text-sm">
                            {c.title} <span className="text-muted font-mono">({c.year})</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>
              )}

              {neighborhood && (
                <section>
                  <h4 className="font-mono text-xs uppercase tracking-wide text-muted mb-1">
                    2-hop citation neighborhood
                  </h4>
                  <p className="text-xs text-muted mb-3">
                    Chains of papers this one cites, and what those papers cite in turn.
                  </p>
                  {neighborhood.length === 0 ? (
                    <EmptyState title="No neighborhood found within 2 hops" />
                  ) : (
                    <ul className="space-y-1.5">
                      {neighborhood.map((row, i) => (
                        <li key={i} className="text-sm rounded-lg bg-panel border border-gold/10 p-3.5">
                          {row.chain.map((n) => n.title).join("  →  ")}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
