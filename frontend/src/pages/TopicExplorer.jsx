import { useEffect, useState } from "react";
import { api, ApiError } from "../services/api";
import { Loading, EmptyState, ErrorState } from "../components/StateViews";

export default function TopicExplorer() {
  const [topics, setTopics] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
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
  }, []);

  async function selectTopic(topic) {
    setSelected(topic);
    setDetail(null);
    setStatus("loading");
    try {
      const d = await api.getTopic(topic.id);
      setDetail(d);
      setStatus("idle");
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "loading" && !topics) return <Loading label="Loading topics…" />;
  if (status === "error" && !selected) return <ErrorState message={errorMsg} />;

  return (
    <div className="space-y-9">
      <div>
        <h2 className="font-display text-xl font-medium mb-1.5">Browse by topic</h2>
        <p className="text-sm text-muted mb-6">
          Every topic in the dataset, ranked by how many papers cover it.
        </p>
      </div>

      {!selected && topics && topics.length === 0 && <EmptyState title="No topics found" />}

      {!selected && topics && topics.length > 0 && (
        <ul className="grid sm:grid-cols-2 gap-3">
          {topics.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => selectTopic(t)}
                className="w-full text-left rounded-xl border border-gold/15 bg-panel p-4 hover:border-gold/40 hover:bg-panel2 transition flex justify-between items-center"
              >
                <span className="font-medium">{t.name}</span>
                <span className="text-xs text-gold font-mono">{t.paper_count} papers</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div className="space-y-7">
          <button onClick={() => setSelected(null)} className="text-xs font-mono text-gold hover:text-goldBright">
            ← Back to topics
          </button>

          <h3 className="font-display text-lg font-medium">{selected.name}</h3>

          {status === "loading" && <Loading label="Loading topic details…" />}
          {status === "error" && <ErrorState message={errorMsg} />}

          {detail && (
            <div className="grid md:grid-cols-2 gap-7">
              <section>
                <h4 className="font-mono text-xs uppercase tracking-wide text-muted mb-3">
                  Papers ({detail.papers.length})
                </h4>
                {detail.papers.length === 0 ? (
                  <EmptyState title="No papers under this topic" />
                ) : (
                  <ul className="space-y-2">
                    {detail.papers.map((p) => (
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
                  Active authors ({detail.authors.length})
                </h4>
                {detail.authors.length === 0 ? (
                  <EmptyState title="No authors found" />
                ) : (
                  <ul className="space-y-2">
                    {detail.authors.slice(0, 10).map((a) => (
                      <li
                        key={a.id}
                        className="rounded-lg border border-gold/10 bg-panel p-3.5 text-sm flex justify-between"
                      >
                        <div>
                          <p className="font-medium">{a.name}</p>
                          <p className="text-muted text-xs">{a.institution}</p>
                        </div>
                        <span className="text-xs text-gold font-mono self-center">
                          {a.papers_in_topic} papers
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="md:col-span-2">
                <h4 className="font-mono text-xs uppercase tracking-wide text-muted mb-3">Related topics</h4>
                {detail.related_topics.length === 0 ? (
                  <EmptyState title="No related topics found" />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {detail.related_topics.map((t) => (
                      <span
                        key={t.id}
                        className="text-xs bg-teal/10 border border-teal/25 text-teal px-3 py-1.5 rounded-full font-mono"
                      >
                        {t.name} · {t.shared_papers} shared
                      </span>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
