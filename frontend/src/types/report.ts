export type ReportTargetType = "listing" | "user" | "message";

export type ReportReason =
  | "alreadytaken"
  | "scam"
  | "wronginfo"
  | "duplicate"
  | "notowner"
  | "discriminatory"
  | "offensive"
  | "other";

export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  detail: string | null;
  status: "open" | "upheld" | "dismissed";
  createdAt: string;
  resolvedAt: string | null;
}
