import type { AaveProtocolActivity } from "@/lib/graph/aave-types";

/**
 * Presentational relabeling of a data source slug (e.g. "aave-v3-ethereum")
 * into a readable form ("Aave V3 / Ethereum") - the underlying value is
 * unchanged, this only affects display.
 */
export function formatDataSource(slug: string): string {
  const known: Record<string, string> = { "aave-v3-ethereum": "Aave V3 / Ethereum" };
  return known[slug] ?? slug;
}

export interface CompactAmount {
  /** Rounded, human-scale display value (e.g. "8.20M"). */
  display: string;
  /** The full-precision decimal value this was derived from - never rounded, never modified. */
  exact: string;
}

/**
 * Renders a large exact decimal string (already normalized from on-chain base
 * units - see the deterministic aggregation layer) as a compact, human-scale
 * figure for the UI, while keeping the exact value available for a tooltip or
 * secondary label. Only the display string is rounded; the underlying value
 * this was computed from is returned untouched as `exact`.
 */
export function formatCompactAmount(normalized: string): CompactAmount {
  const value = Number(normalized);

  if (!Number.isFinite(value)) {
    return { display: normalized, exact: normalized };
  }

  if (value === 0) {
    return { display: "0", exact: normalized };
  }

  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  let magnitude: string;

  if (abs >= 1_000_000_000) {
    magnitude = `${trimToTwoDecimals(abs / 1_000_000_000)}B`;
  } else if (abs >= 1_000_000) {
    magnitude = `${trimToTwoDecimals(abs / 1_000_000)}M`;
  } else if (abs >= 1_000) {
    magnitude = `${trimToTwoDecimals(abs / 1_000)}K`;
  } else if (abs >= 1) {
    magnitude = trimToTwoDecimals(abs);
  } else {
    magnitude = trimSmallValue(abs);
  }

  return { display: `${sign}${magnitude}`, exact: normalized };
}

function trimToTwoDecimals(value: number): string {
  return value.toFixed(2).replace(/\.00$/, "");
}

function trimSmallValue(value: number): string {
  // Sub-1 token amounts (e.g. satoshi-denominated WBTC) can carry real
  // significance out to 8 decimal places - round further out and only then
  // trim trailing zeros, so a genuinely non-zero amount never displays as 0.
  const fixed = value.toFixed(8);
  return fixed.replace(/0+$/, "").replace(/\.$/, "");
}

/** Truncates a hash/address for display while the full value stays available via title/copy. */
export function truncateMiddle(value: string, headLength = 6, tailLength = 4): string {
  if (value.length <= headLength + tailLength + 1) {
    return value;
  }

  return `${value.slice(0, headLength)}…${value.slice(-tailLength)}`;
}

export function formatTimestamp(unixSeconds: number): string {
  const date = new Date(unixSeconds * 1000);
  const datePart = date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const timePart = formatClock(unixSeconds);
  return `${datePart} · ${timePart}`;
}

/** 24-hour clock with seconds, e.g. "14:02:11" - a terminal/ledger-style readout. */
export function formatClock(unixSeconds: number): string {
  const date = new Date(unixSeconds * 1000);
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

export function formatDateRange(oldestTimestamp: number | null, newestTimestamp: number | null): string {
  if (oldestTimestamp === null || newestTimestamp === null) {
    return "No activity in range";
  }

  const format = (seconds: number) =>
    new Date(seconds * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  const oldestLabel = format(oldestTimestamp);
  const newestLabel = format(newestTimestamp);

  return oldestLabel === newestLabel ? oldestLabel : `${oldestLabel} – ${newestLabel}`;
}

export function describeEvidenceShort(activity: AaveProtocolActivity): string {
  if (activity.activityType === "liquidation") {
    return `Liquidation · ${activity.collateralReserveSymbol}/${activity.principalReserveSymbol}`;
  }

  return activity.reserveSymbol ? `${activity.action} · ${activity.reserveSymbol}` : activity.action;
}

export function shortEvidenceId(id: string): string {
  return id.length > 14 ? `${id.slice(0, 14)}…` : id;
}

/**
 * A short, per-investigation display label for an evidence record (e.g.
 * "E-004"), computed purely from its position in the retrieved evidence list.
 * This is a presentational numbering scheme, not a backend-issued identifier -
 * the real evidenceId (used for anchors and evidence-binding) is unaffected
 * and stays available via title/href.
 */
export function evidenceLabel(index: number): string {
  return `E-${String(index + 1).padStart(3, "0")}`;
}

export interface SplitFindingStatement {
  title: string;
  explanation: string | null;
}

/**
 * Findings are a single `statement` string (see report-schema.ts) - there is
 * no separate AI-authored title field. This splits the statement at its first
 * sentence boundary so the UI can show a short lead-in line plus supporting
 * detail, without ever inventing or dropping any of the AI's actual words.
 */
export function splitFindingStatement(statement: string): SplitFindingStatement {
  const trimmed = statement.trim();
  const match = trimmed.match(/^([\s\S]{1,160}?[.!?])(?:\s+([\s\S]+))?$/);

  if (match) {
    const rest = match[2]?.trim();
    return { title: match[1].trim(), explanation: rest && rest.length > 0 ? rest : null };
  }

  if (trimmed.length <= 160) {
    return { title: trimmed, explanation: null };
  }

  const breakPoint = trimmed.lastIndexOf(" ", 140);
  const cut = breakPoint > 40 ? breakPoint : 140;
  return { title: `${trimmed.slice(0, cut).trim()}…`, explanation: trimmed };
}
