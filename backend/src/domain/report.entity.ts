export type ReportTargetType = "listing" | "user" | "message";

export type ReportReason =
  | "alreadytaken" | "scam" | "wronginfo" | "duplicate"
  | "notowner" | "discriminatory" | "offensive" | "other";

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

export type ModerationActionKind =
  | "approvelisting" | "suspendlisting" | "requestfix"
  | "restrictuser" | "unrestrictuser"
  | "striptext" | "rejectphoto"
  | "upholdreport" | "dismissreport" | "rejectlisting"
  | "reinstatelisting" | "editlisting" | "deletelisting"
  | "updateuser" | "changerole" | "deleteuser"
  | "createcity" | "updatecity" | "deletecity"
  | "createlocality" | "updatelocality" | "deletelocality"
  | "createamenity" | "updateamenity" | "deleteamenity";

export interface ModerationAction {
  id: string;
  moderatorId: string;
  targetType: ReportTargetType;
  targetId: string;
  action: ModerationActionKind;
  note: string;
  createdAt: string;
}
