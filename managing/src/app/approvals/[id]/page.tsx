import { ApprovalDetail } from "@/components/managing/approvaldetail";

type Params = Promise<{ id: string }>;

export const metadata = { title: "Review listing" };

/**
 * Full review of one submission.
 *
 * Everything needed to decide is on this page — photos, the exact text, the
 * owner's history, and the flags — because a reviewer who has to open a second
 * tab to check something will eventually stop checking it.
 */
export default async function Page({ params }: { params: Params }) {
  const { id } = await params;

  return <ApprovalDetail listingId={id} />;
}
