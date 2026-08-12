import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../services/api";
import { EmptyState, ErrorState, SkeletonGrid } from "../components/StateViews";
import authorIllustration from "../assets/author-illustration.png";

function ResearcherCard({ author }) {
  return (
    <Link
      to={`/authors/${encodeURIComponent(author.id)}`}
      className="group rounded-xl border border-white/10 bg-navy-800/60 p-5 shadow-card hover:border-gold-500/40 hover:-translate-y-0.5 transition flex flex-col"
    >
      <h3 className="font-serif font-semibold text-ink">{author.name}</h3>
      <p className="text-sm text-inkMuted mt-0.5">{author.institution}</p>

      <p className="text-xs text-gold-400 font-medium mt-3">h-index {author.h_index}</p>
      <p className="text-xs text-inkMuted mt-1">
        {author.papers_count} Papers · {author.co_authors_count} Co-authors ·{" "}
        {author.topics_count} Topics
      </p>

      <span className="text-xs text-gold-400 font-medium mt-4 group-hover:translate-x-0.5 transition">
        View Researcher →
      </span>
    </Link>
  );
}

export default function AuthorExplorer() {
  const [featured, setFeatured] = useState(null);
  const [featuredStatus, setFeaturedStatus] = useState("loading");

  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [results, setResults] = useState(null);
  const [searchStatus, setSearchStatus] = useState("idle"); // idle | loading | error
  const [errorMsg, setErrorMsg] = useState("");

  function loadFeatured() {
    setFeaturedStatus("loading");
    api
      .featuredAuthors()
      .then((rows) => {
        setFeatured(rows);
        setFeaturedStatus("idle");
      })
      .catch((err) => {
        setErrorMsg(err instanceof ApiError ? err.message : "Something went wrong.");
        setFeaturedStatus("error");
      });
  }

  useEffect(loadFeatured, []);

  async function handleSearch(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setActiveQuery(trimmed);
    setSearchStatus("loading");
    try {
      const rows = await api.searchAuthors(trimmed);
      setResults(rows);
      setSearchStatus("idle");
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : "Something went wrong.");
      setSearchStatus("error");
    }
  }

  function clearSearch() {
    setQuery("");
    setActiveQuery("");
    setResults(null);
    setSearchStatus("idle");
  }

  const isSearching = activeQuery !== "";

  return (
    <div className="space-y-10">
      <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-ink">Authors</h2>
          <p className="text-sm text-inkMuted mt-1 mb-5">
            Discover researchers, their publications, expertise and collaboration networks.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search researchers by name…"
              className="flex-1 rounded-full border border-white/15 bg-navy-800/60 text-ink placeholder:text-inkMuted px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500/40"
            />
            <button
              type="submit"
              className="rounded-full bg-gold-500 text-navy-950 text-sm font-semibold px-5 py-2.5 hover:bg-gold-400 transition"
            >
              Search
            </button>
          </form>
        </div>
        <img
          src={authorIllustration}
          alt=""
          className="hidden md:block w-48 opacity-90"
          aria-hidden="true"
        />
      </div>

      {isSearching ? (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-inkMuted uppercase tracking-widest">
              Search results for “{activeQuery}”
            </h3>
            <button onClick={clearSearch} className="text-xs text-gold-400 hover:underline">
              Clear Search
            </button>
          </div>

          {searchStatus === "loading" && <SkeletonGrid count={6} />}
          {searchStatus === "error" && <ErrorState message={errorMsg} onRetry={handleSearch} />}
          {searchStatus === "idle" && results && results.length === 0 && (
            <EmptyState
              title="No researchers found"
              hint="Try searching for another researcher name."
              action={
                <button
                  onClick={clearSearch}
                  className="text-sm px-4 py-1.5 rounded-full border border-white/15 text-ink hover:bg-white/5 transition"
                >
                  Clear Search
                </button>
              }
            />
          )}
          {searchStatus === "idle" && results && results.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((a) => (
                <ResearcherCard key={a.id} author={a} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section>
          <h3 className="text-xs font-semibold text-inkMuted uppercase tracking-widest mb-4">
            Featured Researchers
          </h3>
          {featuredStatus === "loading" && <SkeletonGrid count={9} />}
          {featuredStatus === "error" && <ErrorState message={errorMsg} onRetry={loadFeatured} />}
          {featuredStatus === "idle" && featured && featured.length === 0 && (
            <EmptyState title="No researchers yet" hint="The research graph is empty." />
          )}
          {featuredStatus === "idle" && featured && featured.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((a) => (
                <ResearcherCard key={a.id} author={a} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
