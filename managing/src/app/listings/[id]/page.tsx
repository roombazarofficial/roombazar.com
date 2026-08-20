import { ListingRecordDetail } from "@/components/managing/recorddetail";

type Params = Promise<{ id: string }>;

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  return <ListingRecordDetail id={id} />;
}
