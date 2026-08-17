import { Button } from "@/components/ui/button";

const sessions = [
  { id: "1", device: "Chrome on Android", where: "Bengaluru", lastUsed: "Active now", current: true },
  { id: "2", device: "Safari on iPhone", where: "Bengaluru", lastUsed: "2 days ago", current: false },
  { id: "3", device: "Firefox on Windows", where: "Chennai", lastUsed: "3 weeks ago", current: false },
];

/**
 * Sessions are opaque server-side records rather than stateless tokens
 * precisely so this page can work — revocation has to take effect
 * immediately. See docs/02-architecture.md.
 */
export default function Page() {
  return (
    <div className="max-w-2xl">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Signed-in devices
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Signing out a device takes effect immediately.
        </p>
      </header>

      <ul className="mt-6 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
        {sessions.map((session) => (
          <li key={session.id} className="flex items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">
                {session.device}
                {session.current && (
                  <span className="ml-2 text-xs font-normal text-success">
                    This device
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {session.where} · {session.lastUsed}
              </p>
            </div>

            {!session.current && (
              <Button size="sm" variant="ghost" className="text-danger">
                Sign out
              </Button>
            )}
          </li>
        ))}
      </ul>

      <Button variant="secondary" className="mt-4">
        Sign out everywhere else
      </Button>
    </div>
  );
}
