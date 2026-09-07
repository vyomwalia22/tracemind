const SATELLITES = [
  { key: "transactions", label: "Transactions", x: 230, y: 78, tag: "TX 0x9a4e…c2" },
  { key: "protocol", label: "Protocol", x: 382, y: 230, tag: "AAVE V3" },
  { key: "evidence", label: "Evidence", x: 230, y: 382, tag: "E-014" },
  { key: "assets", label: "Assets", x: 78, y: 230, tag: "USDC · WETH" },
];

const CENTER = { x: 230, y: 230 };

/**
 * A purely illustrative network graphic for the landing hero - it does not
 * represent any real wallet, transaction, or evidence record. Decorative tags
 * (tx hash, protocol, evidence id) are stylized placeholders, not live data.
 */
export function NetworkVisualization() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]">
      <svg viewBox="0 0 460 460" className="h-full w-full overflow-visible" role="img" aria-label="Illustrative diagram of a wallet's connections to transactions, protocol activity, assets, and evidence">
        <defs>
          <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Faint outer ring connecting the satellites - suggests a network, not a star/flowchart. */}
        <polygon
          points={SATELLITES.map((s) => `${s.x},${s.y}`).join(" ")}
          fill="none"
          stroke="var(--muted-2)"
          strokeOpacity="0.35"
          strokeWidth="1"
        />

        {/* Spokes from the wallet to each satellite, with an animated pulse. */}
        {SATELLITES.map((satellite, index) => (
          <g key={satellite.key}>
            <line
              x1={CENTER.x}
              y1={CENTER.y}
              x2={satellite.x}
              y2={satellite.y}
              stroke="var(--muted-2)"
              strokeOpacity="0.4"
              strokeWidth="1"
            />
            <line
              x1={CENTER.x}
              y1={CENTER.y}
              x2={satellite.x}
              y2={satellite.y}
              stroke="var(--cyan)"
              strokeWidth="1.5"
              className="animate-line-pulse"
              style={{ animationDelay: `${index * 0.6}s` }}
            />
          </g>
        ))}

        {/* Ambient drifting particles - purely decorative. */}
        <circle cx={150} cy={310} r={2} fill="var(--gold)" opacity={0.5} className="animate-drift" style={{ animationDelay: "0s" }} />
        <circle cx={320} cy={150} r={1.6} fill="var(--cyan)" opacity={0.5} className="animate-drift" style={{ animationDelay: "1.4s" }} />
        <circle cx={300} cy={330} r={1.6} fill="var(--cyan)" opacity={0.4} className="animate-drift" style={{ animationDelay: "2.6s" }} />

        {/* Satellite nodes. */}
        {SATELLITES.map((satellite) => (
          <g key={satellite.key}>
            <circle cx={satellite.x} cy={satellite.y} r={5} fill="var(--surface-2)" stroke="var(--cyan)" strokeWidth="1.5" />
            <text
              x={satellite.x}
              y={satellite.y + (satellite.y < CENTER.y ? -16 : 26)}
              textAnchor="middle"
              className="fill-foreground/70 font-mono text-[10px] uppercase tracking-[0.08em]"
            >
              {satellite.label}
            </text>
            <text
              x={satellite.x}
              y={satellite.y + (satellite.y < CENTER.y ? -4 : 38)}
              textAnchor="middle"
              className="fill-muted-2 font-mono text-[9px]"
            >
              {satellite.tag}
            </text>
          </g>
        ))}

        {/* Central wallet node. */}
        <circle cx={CENTER.x} cy={CENTER.y} r={9} fill="var(--gold)" filter="url(#glow)" className="animate-node-glow" />
        <circle cx={CENTER.x} cy={CENTER.y} r={9} fill="var(--gold)" />
        <text x={CENTER.x} y={CENTER.y + 30} textAnchor="middle" className="fill-gold font-mono text-[11px] uppercase tracking-[0.1em]">
          Wallet
        </text>
      </svg>

      <p className="absolute bottom-0 right-0 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-2">
        Illustrative
      </p>
    </div>
  );
}
