// Lightweight inline SVG illustrations used across hero sections.
// The project has no raster image assets checked in, so these are built as
// code (not generated images) to keep the network/graph motif consistent
// with the navy/gold/teal theme without adding binary files to the repo.

const NODES = [
  { x: 40, y: 60, r: 5, c: "gold" },
  { x: 140, y: 30, r: 4, c: "teal" },
  { x: 220, y: 90, r: 6, c: "gold" },
  { x: 90, y: 140, r: 4, c: "teal" },
  { x: 190, y: 170, r: 5, c: "gold" },
  { x: 270, y: 40, r: 3.5, c: "teal" },
  { x: 60, y: 200, r: 4.5, c: "teal" },
  { x: 250, y: 190, r: 4, c: "gold" },
];

const EDGES = [
  [0, 1], [1, 2], [1, 3], [2, 4], [3, 4], [2, 5], [3, 6], [4, 7], [0, 3],
];

function colorFor(c) {
  return c === "gold" ? "#e8b84b" : "#5eead4";
}

export function NetworkGraphic({ className = "" }) {
  return (
    <svg
      viewBox="0 0 300 230"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="ngGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#e8b84b" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#e8b84b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="150" cy="115" r="140" fill="url(#ngGlow)" />
      {EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          stroke="#5eead4"
          strokeOpacity="0.35"
          strokeWidth="1"
        />
      ))}
      {NODES.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={n.r}
          fill={colorFor(n.c)}
          fillOpacity="0.9"
        />
      ))}
    </svg>
  );
}

export function PapersGraphic({ className = "" }) {
  return (
    <svg
      viewBox="0 0 300 230"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="pgGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#5eead4" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#5eead4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="150" cy="115" r="140" fill="url(#pgGlow)" />
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={70 + i * 26}
          y={70 - i * 14}
          width="90"
          height="118"
          rx="6"
          stroke="#e8b84b"
          strokeOpacity={0.55 - i * 0.15}
          fill="#111a2e"
          fillOpacity="0.6"
        />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={92}
          y1={62 + i * 12}
          x2={150}
          y2={62 + i * 12}
          stroke="#93a0bd"
          strokeOpacity="0.5"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

export function ConstellationGraphic({ className = "" }) {
  return <NetworkGraphic className={className} />;
}
