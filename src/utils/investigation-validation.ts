import type {
  InvestigationQuestion,
  InvestigationRequest,
  InvestigationValidationError,
  WalletAddress,
} from "@/types/investigation";

export const MAX_INVESTIGATION_QUESTION_LENGTH = 1_000;

const evmWalletAddressPattern = /^0x[a-fA-F0-9]{40}$/;

export function isValidEvmWalletAddress(value: string): value is WalletAddress {
  return evmWalletAddressPattern.test(value.trim());
}

export function isValidInvestigationQuestion(value: string): value is InvestigationQuestion {
  const question = value.trim();
  return question.length > 0 && question.length <= MAX_INVESTIGATION_QUESTION_LENGTH;
}

export function validateInvestigationRequest(
  value: unknown,
): { success: true; data: InvestigationRequest } | { success: false; errors: InvestigationValidationError[] } {
  if (!isRecord(value)) {
    return { success: false, errors: [{ field: "question", code: "required", message: "Request body must be an object." }] };
  }

  const errors: InvestigationValidationError[] = [];
  const walletAddress = typeof value.walletAddress === "string" ? value.walletAddress.trim() : "";
  const question = typeof value.question === "string" ? value.question.trim() : "";

  if (!isValidEvmWalletAddress(walletAddress)) {
    errors.push({ field: "walletAddress", code: "invalid_format", message: "Enter a valid EVM wallet address." });
  }

  if (question.length === 0) {
    errors.push({ field: "question", code: "required", message: "Investigation question is required." });
  } else if (question.length > MAX_INVESTIGATION_QUESTION_LENGTH) {
    errors.push({ field: "question", code: "too_long", message: `Investigation question must be ${MAX_INVESTIGATION_QUESTION_LENGTH} characters or fewer.` });
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const validatedWalletAddress = walletAddress as WalletAddress;
  const validatedQuestion = question as InvestigationQuestion;

  return {
    success: true,
    data: {
      walletAddress: validatedWalletAddress,
      question: validatedQuestion,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}