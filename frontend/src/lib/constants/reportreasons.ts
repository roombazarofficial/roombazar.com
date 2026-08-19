/**
 * Ordered by how often they occur and how useful they are to act on.
 * "Already taken" leads because it is both the most frequent and the one that
 * protects the metric the marketplace is judged on.
 */
export const reportReasons = [
  { value: "alreadytaken", label: "The room is already taken" },
  { value: "scam", label: "Fake listing or a scam" },
  { value: "wronginfo", label: "Details are wrong or misleading" },
  { value: "duplicate", label: "Duplicate of another listing" },
  { value: "notowner", label: "Posted by an agent claiming to be the owner" },
  { value: "discriminatory", label: "Discriminatory wording" },
  { value: "offensive", label: "Offensive or inappropriate content" },
  { value: "other", label: "Something else" },
] as const;

export type ReportReason = (typeof reportReasons)[number]["value"];
