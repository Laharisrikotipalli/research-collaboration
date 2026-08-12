import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../services/api";
import { EmptyState, ErrorState, SkeletonGrid } from "../components/StateViews";

function TopicCard({ topic }) {
  return (
    <Link
      to={`/topics/${encodeURIComponent(topic.id)}`}
      className="group rounded-xl border border-white/10 bg-navy-800/60 p-5 shadow-card hover:border-gold-500/40 hover:-translate-y-0.5 transition flex flex-col"
    >
      <h3 className="font-serif font-semibold text-ink">{topic.name}</h3>
      <p className="text-xs text-inkMuted mt-3">{topic.paper_count} Papers</p>
      <p className="text-xs text-inkMuted mt-0.5">{topic.researcher_count} Researchers</p>
      <span className="text-xs text-gold-400 font-medium mt-4 group-hover:translate-x-0.5 transition">
        Explore Topic →
      </span>
    </Link>
  );
}

export default function TopicExplorer() {
  const [topics, setTopics] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [query, setQuery] = useState("");

  function load() {
    setStatus("loading");
    api
      .listTopics()
      .then((rows) => {
        setTopics(rows);
        setStatus("idle");
      })
      .catch((err) => {
        setErrorMsg(err instanceof ApiError ? err.message : "Something went wrong.");
        setStatus("error");
      });
  }

  useEffect(load, []);

  const filtered = useMemo(() => {
    if (!topics) return null;
    const q = query.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter((t) => t.name.toLowerCase().includes(q));
  }, [topics, query]);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-ink">Research Topics</h2>
        <p className="text-sm text-inkMuted mt-1 mb-5">
          Explore research areas and discover researchers working in them.
        </p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search topics…"
          className="w-full max-w-xl rounded-full border border-white/15 bg-navy-800/60 text-ink placeholder:text-inkMuted px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500/40"
        />
      </div>

      <section>
        <h3 className="text-xs font-semibold text-inkMuted uppercase tracking-widest mb-4">
          Research Areas
        </h3>
        {status === "loading" && <SkeletonGrid count={9} />}
        {status === "error" && <ErrorState message={errorMsg} onRetry={load} />}
        {status === "idle" && filtered && filtered.length === 0 && (
          <EmptyState
            title="No topics found"
            hint="Try a different search term."
            action={
              query ? (
                <button
                  onClick={() => setQuery("")}
                  className="text-sm px-4 py-1.5 rounded-full border border-white/15 text-ink hover:bg-white/5 transition"
                >
                  Clear Search
                </button>
              ) : null
            }
          />
        )}
        {status === "idle" && filtered && filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t) => (
              <TopicCard key={t.id} topic={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
