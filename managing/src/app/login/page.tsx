import { Suspense } from "react";
import { LoginForm } from "@/components/managing/loginform";

export const metadata = { title: "Sign in" };

/**
 * The console's own sign-in.
 *
 * Deliberately outside ManagingShell: the sidebar and its links are useless to
 * someone who is not signed in, and rendering them around a login form implies
 * the console is already open to them.
 */
export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-12">
      <div>
        <p className="text-lg font-semibold tracking-tight text-ink">
          RoomBazar <span className="text-ink-muted">management</span>
        </p>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Super admin access. Every action taken here is written to the audit
          log.
        </p>
      </div>

      {/* useSearchParams needs a boundary or the whole route opts out of static rendering. */}
      <Suspense fallback={null}>
        <div className="mt-8">
          <LoginForm />
        </div>
      </Suspense>
    </main>
  );
}
