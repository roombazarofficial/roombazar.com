import { api } from "./client";

export function reportListing(input: {
  listingId: string;
  reason: string;
  detail: string | null;
}) {
  return api.post("/reports", {
    targetType: "listing",
    targetId: input.listingId,
    reason: input.reason,
    detail: input.detail,
  });
}