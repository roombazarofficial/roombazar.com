import { cn } from "@/lib/utils/classnames";

/**
 * The single most effective defence we have against the dominant rental
 * scam in this market: an attractive listing, a refused visit, and a request
 * for a token advance over UPI.
 *
 * A seeker who has internalised "never pay before visiting" is immune to the
 * entire class, so this appears on every listing rather than being tucked
 * into a help page. See docs/03-trust-and-safety.md.
 */
export function PaymentSafetyNotice({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "rounded-card border border-warning/20 bg-warning-soft p-4",
        className,
      )}
    >
      <h2 className="text-sm font-semibold text-warning">
        Before you pay anything
      </h2>
      <ul className="mt-2 space-y-1.5 text-sm text-warning">
        <li>RoomBazar never collects rent, deposits or booking fees.</li>
        <li>Always visit the room in person before paying anyone.</li>
        <li>
          If a lister refuses a visit or asks for an advance to hold the room,
          report them.
        </li>
      </ul>
    </aside>
  );
}
