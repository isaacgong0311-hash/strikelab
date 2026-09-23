import type { CapstonePromptId } from "./prompts";

export interface Capstone {
  id: string;
  classId: string;
  promptId: CapstonePromptId;
  title: string;
  thesis: string;
  code: string;
  resultSummary: string;
  reflection: string;
  status: "draft" | "submitted";
  shareToken: string | null;
  updatedAt: string;
  submittedAt: string | null;
}

export const CAPSTONE_COLUMNS =
  "id, class_id, prompt_id, title, thesis, code, result_summary, reflection, status, share_token, updated_at, submitted_at";

export function rowToCapstone(row: Record<string, unknown>): Capstone {
  return {
    id: row.id as string,
    classId: row.class_id as string,
    promptId: row.prompt_id as CapstonePromptId,
    title: (row.title as string) ?? "",
    thesis: (row.thesis as string) ?? "",
    code: (row.code as string) ?? "",
    resultSummary: (row.result_summary as string) ?? "",
    reflection: (row.reflection as string) ?? "",
    status: row.status === "submitted" ? "submitted" : "draft",
    shareToken: (row.share_token as string | null) ?? null,
    updatedAt: row.updated_at as string,
    submittedAt: (row.submitted_at as string | null) ?? null,
  };
}
