import { formatCompactAmount } from "@/components/investigation/format";
import type { AaveActivityAggregates, AssetAggregate } from "@/lib/investigation/aggregates";
import type { InvestigationReport } from "@/types/investigation-report";

export function AssessmentSummary({
  report,
  aggregates,
}: {
  report: InvestigationReport;
  aggregates: AaveActivityAggregates;
}) {
  const findingCount = report.findings.filter((finding) => finding.evidenceIds.length > 0).length;
  const featuredAsset = findMostActiveAsset(aggregates);

  const signals: Array<{ label: string; value: string }> = [
    { label: "model", value: report.model },
    { label: "evidence", value: `${report.evidenceCount} records` },
    { label: "findings", value: String(findingCount) },
    { label: "events analyzed", value: String(aggregates.totalEventCount) },
  ];

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-cyan">Section 03 — The assessment</p>
      <h2 className="font-display mt-3 text-4xl leading-tight text-foreground sm:text-5xl">Assessment</h2>
      <p className="mt-6 max-w-3xl text-[17px] leading-8 text-foreground/90">{report.summary}</p>

      <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-border pt-6 sm:grid-cols-4">
        {signals.map((signal) => (
          <div key={signal.label}>
            <dd className="font-mono text-lg text-foreground sm:text-xl">{signal.value}</dd>
            <dt className="mt-0.5 text-xs uppercase tracking-[0.08em] text-muted-2">{signal.label}</dt>
          </div>
        ))}
      </dl>

      {featuredAsset && (
        <div className="mt-6 border-l-2 border-gold/50 py-1 pl-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-cyan">Most active asset · {featuredAsset.symbol}</p>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <FeaturedMetric label="Supply" amount={featuredAsset.totalSupply.normalized} symbol={featuredAsset.symbol} />
            <FeaturedMetric label="Borrow" amount={featuredAsset.totalBorrow.normalized} symbol={featuredAsset.symbol} />
            <FeaturedMetric label="Repay" amount={featuredAsset.totalRepay.normalized} symbol={featuredAsset.symbol} />
            <FeaturedMetric
              label="Net exposure"
              amount={featuredAsset.netBorrowExposure.normalized}
              symbol={featuredAsset.symbol}
              emphasis
            />
          </div>
        </div>
      )}

      <p className="mt-4 font-mono text-xs text-muted-2">Generated {new Date(report.generatedAt).toLocaleString()}</p>
    </div>
  );
}

function FeaturedMetric({
  label,
  amount,
  symbol,
  emphasis,
}: {
  label: string;
  amount: string;
  symbol: string;
  emphasis?: boolean;
}) {
  const { display, exact } = formatCompactAmount(amount);
  const numeric = Number(amount);
  const tone = emphasis ? (numeric < 0 ? "text-negative" : "text-positive") : "text-foreground/85";

  return (
    <div>
      <p className={`font-mono text-base ${tone}`} title={`${exact} ${symbol} (exact)`}>
        {emphasis && numeric > 0 ? "+" : ""}
        {display}
      </p>
      <p className="mt-0.5 text-[10px] uppercase tracking-[0.08em] text-muted-2">{label}</p>
    </div>
  );
}

function findMostActiveAsset(aggregates: AaveActivityAggregates): AssetAggregate | null {
  let best: AssetAggregate | null = null;
  let bestCount = 0;

  for (const asset of Object.values(aggregates.perAsset)) {
    const count =
      asset.totalSupply.eventCount +
      asset.totalBorrow.eventCount +
      asset.totalRepay.eventCount +
      asset.totalLiquidationCollateralSeized.eventCount +
      asset.totalLiquidationPrincipalRepaid.eventCount;

    if (count > bestCount) {
      best = asset;
      bestCount = count;
    }
  }

  return best;
}
