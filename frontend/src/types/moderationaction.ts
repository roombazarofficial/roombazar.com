export interface ModerationAction {
  id: string;
  moderatorId: string;
  targetType: "listing" | "user" | "message";
  targetId: string;
  action: string;
  note: string;
  createdAt: string;
}
