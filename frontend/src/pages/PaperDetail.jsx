import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../services/api";
import { Loading, EmptyState, ErrorState } from "../components/StateViews";

export default function PaperDetail() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [citations, setCitations] = useState(null);
  const [neighborhood, setNeighborhood] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [showNeighborhood, setShowNeighborhood] = useState(false);

  function load() {
    setStatus("loading");
    Promise.all([api.getPaper(id), api.getCitations(id), api.getCitationNeighborhood(id)])
      .then(([d, c, n]) => {
        setDetail(d);
        setCitations(c);
        setNeighborhood(n);
        setStatus("idle");
      })
      .catch((err) => {
        setErrorMsg(err instanceof ApiError ? err.message : "Something went wrong.");
        setStatus("error");
      });
  }

  useEffect(load, [id]);

  if (status === "loading") return <Loading label="Loading paper…" />;
  if (status === "error") return <ErrorState message={errorMsg} onRetry={load} />;
  if (!detail) return <EmptyState title="Paper not found" />;

  const authors = (detail.authors || []).filter((a) => a.id);
  const topics = (detail.topics || []).filter((t) => t.id);

  return (
    <div className="space-y-10">
      <div>
        <Link to="/papers" className="text-sm text-gold-400 hover:underline">
          ← Back to Papers
        </Link>
        <h2 className="font-serif text-2xl font-semibold text-ink mt-3 leading-snug">
          {detail.title}
        </h2>
        <p className="text-sm text-inkMuted mt-1">
          {detail.year} · {detail.citation_count} citations
        </p>
        {detail.abstract && (
          <p className="text-sm text-ink/80 mt-4 leading-relaxed max-w-3xl">{detail.abstract}</p>
        )}
        <button
          onClick={() => setShowNeighborhood((v) => !v)}
          className="mt-5 rounded-full bg-gold-500 text-navy-950 text-sm font-semibold px-5 py-2 hover:bg-gold-400 transition"
        >
          {showNeighborhood ? "Hide Citation Network" : "Explore Citation Network"}
        </button>
      </div>

      <section>
        <h3 className="text-xs font-semibold text-inkMuted uppercase tracking-widest mb-3">
          Authors
        </h3>
        {authors.length === 0 ? (
          <EmptyState title="No authors recorded" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {authors.map((a) => (
              <Link
                key={a.id}
                to={`/authors/${encodeURIComponent(a.id)}`}
                className="text-xs bg-navy-800/60 border border-white/10 text-ink px-3 py-1.5 rounded-full hover:border-gold-500/40 transition"
              >
                {a.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-xs font-semibold text-inkMuted uppercase tracking-widest mb-3">
          Topics
        </h3>
        {topics.length === 0 ? (
          <EmptyState title="No topics recorded" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <Link
                key={t.id}
                to={`/topics/${encodeURIComponent(t.id)}`}
                className="text-xs bg-gold-soft text-gold-400 border border-gold-500/20 px-3 py-1 rounded-full font-medium hover:border-gold-500/50 transition"
              >
                {t.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      {citations && (
        <div className="grid md:grid-cols-2 gap-6">
          <section>
            <h3 className="text-xs font-semibold text-inkMuted uppercase tracking-widest mb-3">
              Cites ({citations.cites.length})
            </h3>
            {citations.cites.length === 0 ? (
              <EmptyState title="Doesn't cite any papers in this dataset" />
            ) : (
              <ul className="space-y-2">
                {citations.cites.map((c) => (
                  <li key={c.id}>
                    <Link
                      to={`/papers/${encodeURIComponent(c.id)}`}
                      className="block rounded-lg border border-white/10 bg-navy-800/60 p-3 text-sm hover:border-gold-500/40 transition"
                    >
                      {c.title} <span className="text-inkMuted">({c.year})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h3 className="text-xs font-semibold text-inkMuted uppercase tracking-widest mb-3">
              Cited By ({citations.cited_by.length})
            </h3>
            {citations.cited_by.length === 0 ? (
              <EmptyState title="Not yet cited in this dataset" />
            ) : (
              <ul className="space-y-2">
                {citations.cited_by.map((c) => (
                  <li key={c.id}>
                    <Link
                      to={`/papers/${encodeURIComponent(c.id)}`}
                      className="block rounded-lg border border-white/10 bg-navy-800/60 p-3 text-sm hover:border-gold-500/40 transition"
                    >
                      {c.title} <span className="text-inkMuted">({c.year})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {showNeighborhood && neighborhood && (
        <section>
          <h3 className="text-xs font-semibold text-inkMuted uppercase tracking-widest mb-1">
            2-Hop Citation Neighborhood
          </h3>
          <p className="text-xs text-inkMuted mb-3">
            Chains of papers this one cites, and what those papers cite in turn.
          </p>
          {neighborhood.length === 0 ? (
            <EmptyState title="No neighborhood found within 2 hops" />
          ) : (
            <ul className="space-y-1.5">
              {neighborhood.map((row, i) => (
                <li
                  key={i}
                  className="text-sm rounded-lg bg-navy-800/60 border border-white/10 p-3 text-ink/90"
                >
                  {row.chain.map((n) => n.title).join("  →  ")}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
