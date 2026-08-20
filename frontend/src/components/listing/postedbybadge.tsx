import { Badge } from "@/components/ui/badge";
import type { PostedBy } from "@/types/listing";

const labels: Record<PostedBy, string> = {
  owner: "Owner",
  tenant: "Current tenant",
  agent: "Agent",
};

export function PostedByBadge({ postedBy }: { postedBy: PostedBy }) {
  return (
    <Badge tone={postedBy === "agent" ? "neutral" : "success"} dot>
      {labels[postedBy]}
    </Badge>

  );
}
