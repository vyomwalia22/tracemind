import { NextResponse } from "next/server";

import { getAaveWalletActivity } from "@/lib/graph/aave";
import { GraphClientError } from "@/lib/graph/errors";
import { runInvestigation } from "@/lib/investigation/engine";
import { createClaudeInvestigationProvider } from "@/lib/investigation/providers/claude-provider";
import type { InvestigationRetrievalResponse } from "@/types/investigation-response";
import { validateInvestigationRequest } from "@/utils/investigation-validation";

const DEFAULT_AAVE_ACTIVITY_LIMIT = 25;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "invalid_json",
          message: "Request body must contain valid JSON.",
        },
      },
      { status: 400 },
    );
  }

  const validation = validateInvestigationRequest(body);

  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "validation_failed",
          message: "Investigation request is invalid.",
          fields: validation.errors,
        },
      },
      { status: 400 },
    );
  }

  try {
    const aaveActivity = await getAaveWalletActivity(validation.data.walletAddress, DEFAULT_AAVE_ACTIVITY_LIMIT);

    const investigation = await runInvestigation({
      walletAddress: validation.data.walletAddress,
      question: validation.data.question,
      aaveActivity,
      createProvider: createClaudeInvestigationProvider,
    });

    const response: InvestigationRetrievalResponse = {
      success: true,
      status: "data_retrieved",
      walletAddress: validation.data.walletAddress,
      question: validation.data.question,
      dataSources: ["aave-v3-ethereum"],
      aaveActivity,
      recordCount: aaveActivity.length,
      investigation,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof GraphClientError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: getGraphErrorStatus(error) },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "aave_data_source_error",
          message: "Aave activity could not be retrieved.",
        },
      },
      { status: 502 },
    );
  }
}

function getGraphErrorStatus(error: GraphClientError): number {
  if (error.code === "configuration_error") {
    return 500;
  }

  return 502;
}
