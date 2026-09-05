import { z } from "zod";

export const investigationFindingConfidenceSchema = z.enum(["low", "medium", "high"]);

export const aiInvestigationFindingSchema = z.object({
  statement: z.string().min(1).max(600),
  evidenceIds: z.array(z.string().min(1)).min(1).max(25),
  confidence: investigationFindingConfidenceSchema,
});

export const aiInvestigationOutputSchema = z.object({
  summary: z.string().min(1).max(2000),
  findings: z.array(aiInvestigationFindingSchema).max(25),
});

export type AiInvestigationFinding = z.infer<typeof aiInvestigationFindingSchema>;
export type AiInvestigationOutput = z.infer<typeof aiInvestigationOutputSchema>;
