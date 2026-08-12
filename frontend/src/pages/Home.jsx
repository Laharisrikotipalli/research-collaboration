import { Link } from "react-router-dom";
import { NetworkGraphic } from "../components/Illustrations";

const FEATURES = [
  {
    to: "/authors",
    title: "Researchers",
    blurb: "Browse researchers by h-index, institution, and topic — or search by name.",
  },
  {
    to: "/papers",
    title: "Papers",
    blurb: "Explore publications, citation counts, and who's citing whom.",
  },
  {
    to: "/topics",
    title: "Topics",
    blurb: "See which research areas are most active, and who works in them.",
  },
  {
    to: "/path",
    title: "Collaboration Path",
    blurb: "Find the shortest chain of co-authorship connecting any two researchers.",
  },
];

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-gold-400 text-xs font-semibold tracking-widest uppercase mb-3">
            Graph-native research explorer
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold leading-tight text-ink">
            Map how research really connects.
          </h2>
          <p className="text-inkMuted mt-4 text-base leading-relaxed">
            Traverse a live graph of researchers, papers, citations, and topics —
            built on CognoDB. Find hidden collaboration paths, discover potential
            co-authors, and follow citation chains that would take recursive joins
            to express in a relational database.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <Link
              to="/authors"
              className="rounded-full bg-gold-500 text-navy-950 text-sm font-semibold px-5 py-2.5 hover:bg-gold-400 transition"
            >
              Browse researchers
            </Link>
            <Link
              to="/path"
              className="rounded-full border border-white/15 text-ink text-sm font-medium px-5 py-2.5 hover:bg-white/5 transition"
            >
              Find a collaboration path
            </Link>
          </div>
        </div>
        <div className="flex justify-center">
          <NetworkGraphic className="w-full max-w-sm" />
        </div>
      </section>

      <section>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="rounded-xl border border-white/10 bg-navy-800/60 p-5 shadow-card hover:border-gold-500/40 hover:-translate-y-0.5 transition"
            >
              <h3 className="font-serif font-semibold text-ink">{f.title}</h3>
              <p className="text-sm text-inkMuted mt-2 leading-relaxed">{f.blurb}</p>
              <span className="text-xs text-gold-400 font-medium mt-3 inline-block">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
