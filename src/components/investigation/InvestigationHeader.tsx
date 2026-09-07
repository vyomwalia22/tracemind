import { formatDataSource } from "@/components/investigation/format";
import { CopyableHash, StatusMarker } from "@/components/investigation/primitives";
import type { InvestigationRetrievalResponse } from "@/types/investigation-response";

export function InvestigationHeader({ retrieval }: { retrieval: InvestigationRetrievalResponse }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-2">Case 001</p>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        <StatusMarker status={retrieval.investigation.status} />
        <span className="font-mono text-xs uppercase tracking-[0.1em] text-muted">
          {retrieval.dataSources.map(formatDataSource).join(" / ")}
        </span>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-[auto_1fr] sm:gap-x-10">
        <div>
          <p className="text-xs text-muted-2">wallet</p>
          <div className="mt-1">
            <CopyableHash value={retrieval.walletAddress} />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-2">question</p>
          <p className="mt-1 max-w-2xl text-[15px] leading-6 text-foreground/90">&ldquo;{retrieval.question}&rdquo;</p>
        </div>
      </div>
    </div>
  );
}
