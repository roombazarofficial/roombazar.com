import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { routes } from "@/lib/constants/routes";

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">
        Post your room
      </h1>
      <p className="mt-3 text-base text-ink-muted">
        It takes about three minutes and costs nothing. You keep full control
        of who contacts you, and your phone number stays private until you
        choose to share it.
      </p>

      <ul className="mt-8 space-y-3">
        {[
          "No listing fee and no commission — ever.",
          "Seekers message you here; your number is never shown publicly.",
          "Mark the room taken with one tap when you are done.",
        ].map((item) => (
          <li key={item} className="flex gap-3 text-sm text-ink">
            <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-600" />
            {item}
          </li>
        ))}
      </ul>

      <Link
        href={routes.postStep("basic-details")}
        className={buttonStyles({ size: "lg", className: "mt-9" })}
      >
        Start
      </Link>
    </div>
  );
}
