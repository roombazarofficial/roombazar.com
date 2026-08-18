import { serverApi as api, serverTryGet as tryGet } from "./serverclient";
import type { Report } from "@/types/report";
import type { ModerationAction } from "@/types/moderationaction";

export function getModerationQueue(): Promise<Report[]> {
  return tryGet<Report[]>("/moderation/queue", []);
}

export function getAuditLog(): Promise<ModerationAction[]> {
  return tryGet<ModerationAction[]>("/moderation/auditlog", []);
}

export function approveListing(id: string, note: string) {
  return api.post(`/moderation/listings/${id}/approve`, { note });
}

export function suspendListing(id: string, note: string) {
  return api.post(`/moderation/listings/${id}/suspend`, { note });
}

export function restrictUser(id: string, note: string) {
  return api.post(`/moderation/users/${id}/restrict`, { note });
}

export function resolveReport(
  id: string,
  outcome: "upheld" | "dismissed",
  note: string,
) {
  return api.post(`/moderation/reports/${id}/resolve`, { outcome, note });
}
