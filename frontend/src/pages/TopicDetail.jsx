import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../services/api";
import { Loading, EmptyState, ErrorState } from "../components/StateViews";

export default function TopicDetail() {
  const { id } = useParams();
  const [topicName, setTopicName] = useState(null);
  const [detail, setDetail] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  function load() {
    setStatus("loading");
    // The topic name/counts aren't part of the detail response, so we pull
    // them from the same list endpoint the Topics page already uses.
    Promise.all([api.listTopics(), api.getTopic(id)])
      .then(([topics, d]) => {
        const match = topics.find((t) => t.id === id);
        setTopicName(match || null);
        setDetail(d);
        setStatus("idle");
      })
      .catch((err) => {
        setErrorMsg(err instanceof ApiError ? err.message : "Something went wrong.");
        setStatus("error");
      });
  }

  useEffect(load, [id]);

  if (status === "loading") return <Loading label="Loading topic…" />;
  if (status === "error") return <ErrorState message={errorMsg} onRetry={load} />;
  if (!detail) return <EmptyState title="Topic not found" />;

  return (
    <div className="space-y-10">
      <div>
        <Link to="/topics" className="text-sm text-gold-400 hover:underline">
          ← Back to Topics
        </Link>
        <h2 className="font-serif text-2xl font-semibold text-ink mt-3">
          {topicName ? topicName.name : "Topic"}
        </h2>
        {topicName && (
          <p className="text-sm text-inkMuted mt-1">
            {topicName.researcher_count} Researchers · {topicName.paper_count} Papers
          </p>
        )}
      </div>

      <section>
        <h3 className="text-xs font-semibold text-inkMuted uppercase tracking-widest mb-3">
          Researchers
        </h3>
        {detail.authors.length === 0 ? (
          <EmptyState title="No researchers found" />
        ) : (
          <ul className="grid sm:grid-cols-2 gap-3">
            {detail.authors.map((a) => (
              <li key={a.id}>
                <Link
                  to={`/authors/${encodeURIComponent(a.id)}`}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-navy-800/60 p-4 text-sm hover:border-gold-500/40 transition"
                >
                  <div>
                    <p className="font-medium text-ink">{a.name}</p>
                    <p className="text-inkMuted text-xs">{a.institution}</p>
                  </div>
                  <span className="text-xs text-gold-400 font-medium">
                    {a.papers_in_topic} papers
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="text-xs font-semibold text-inkMuted uppercase tracking-widest mb-3">
          Papers
        </h3>
        {detail.papers.length === 0 ? (
          <EmptyState title="No papers under this topic" />
        ) : (
          <ul className="grid sm:grid-cols-2 gap-3">
            {detail.papers.map((p) => (
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

      <section>
        <h3 className="text-xs font-semibold text-inkMuted uppercase tracking-widest mb-3">
          Related Topics
        </h3>
        {detail.related_topics.length === 0 ? (
          <EmptyState title="No related topics found" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {detail.related_topics.map((t) => (
              <Link
                key={t.id}
                to={`/topics/${encodeURIComponent(t.id)}`}
                className="text-xs bg-gold-soft text-gold-400 border border-gold-500/20 px-3 py-1 rounded-full font-medium hover:border-gold-500/50 transition"
              >
                {t.name} · {t.shared_papers} shared
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
