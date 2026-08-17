import { Badge } from "@/components/ui/badge";
import type { PostedBy } from "@/types/listing";

const labels: Record<PostedBy, string> = {
  owner: "Owner",
  tenant: "Current tenant",
  agent: "Agent",
};

/**
 * Brokers are labelled rather than banned — banning is unenforceable and only
 * makes them lie about it. Owner and tenant read as positive, agent stays
 * neutral rather than negative: the badge informs, it does not shame.
 */
export function PostedByBadge({ postedBy }: { postedBy: PostedBy }) {
  return (
    <Badge tone={postedBy === "agent" ? "neutral" : "success"} dot>
      {labels[postedBy]}
    </Badge>
  );
}
