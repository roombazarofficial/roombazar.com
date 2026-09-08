import Link from "next/link";
import { SiteShell } from "@/components/layout/siteshell";
import { routes } from "@/lib/constants/routes";

const cities: { label: string; slug: string }[] = [
  { label: "Bengaluru", slug: "bengaluru" },
  { label: "Noida", slug: "gautam-buddha-nagar" },
  { label: "Delhi NCR", slug: "delhi" },
  { label: "Gurugram", slug: "gurugram" },
  { label: "Ghaziabad", slug: "ghaziabad" },
  { label: "Mumbai", slug: "mumbai" },
  { label: "Pune", slug: "pune" },
  { label: "Hyderabad", slug: "hyderabad" },
];

export default function NotFound() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">
          404
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          This page isn&rsquo;t here
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
          The link may be broken, or the room may have been taken down. Try
          browsing current rooms instead.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={routes.rooms}
            className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Browse all rooms
          </Link>
          <Link
            href={routes.home}
            className="rounded-xl border border-line px-6 py-2.5 text-sm font-semibold text-ink hover:border-line-strong"
          >
            Go to homepage
          </Link>
        </div>

        <div className="mt-12 border-t border-line pt-8">
          <h2 className="text-sm font-semibold text-ink">Rooms by city</h2>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {cities.map((city) => (
              <Link
                key={city.slug}
                href={routes.city(city.slug)}
                className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-muted hover:border-line-strong hover:text-ink"
              >
                Rooms in {city.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
