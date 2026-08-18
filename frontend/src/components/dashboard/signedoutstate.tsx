import Link from "next/link";
import { EmptyState } from "@/components/ui/emptystate";
import { buttonStyles } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

export function SignedOutState({ what }: { what: string }) {
  return (
    <EmptyState
      title={`Sign in to see your ${what}`}
      description="Your session has expired, or you are not signed in yet."
      action={
        <Link href={routes.home} className={buttonStyles()}>
          Go to sign in
        </Link>

      }
    />

  );
}
