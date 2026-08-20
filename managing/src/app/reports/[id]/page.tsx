import { ReportDetail } from "@/components/managing/reportdetail";

type Params = Promise<{ id: string }>;

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  return <ReportDetail id={id} />;
}
