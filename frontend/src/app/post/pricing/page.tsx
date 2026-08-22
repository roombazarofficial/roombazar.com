import { redirect } from "next/navigation";
import { routes } from "@/lib/constants/routes";

export default function Page() {
  redirect(routes.post);
}
