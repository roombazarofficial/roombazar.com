import { api } from "./client";

export interface DraftRecord {
  data: Record<string, unknown> | null;
  updatedAt: string | null;
}

export function getDraft(): Promise<DraftRecord> {
  return api.get<DraftRecord>("/listings/draft");
}

export function saveDraft(draft: unknown): Promise<DraftRecord> {
  return api.put<DraftRecord>("/listings/draft", draft);
}

export function discardDraft(): Promise<void> {
  return api.delete<void>("/listings/draft");
}
