import { NextResponse } from "next/server";

import { validateInvestigationRequest } from "@/utils/investigation-validation";

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

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "pipeline_unavailable",
        message: "The investigation pipeline is not connected yet.",
      },
    },
    { status: 501 },
  );
}