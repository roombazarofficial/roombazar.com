import { redirect } from "next/navigation";

type Params = Promise<{ id: string }>;

export default async function Page({ params }: { params: Params }) {
  await params;
  redirect("/verification");
}
