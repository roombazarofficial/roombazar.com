import Link from "next/link";
import { routes } from "@/lib/constants/routes";
import { Logo } from "@/components/layout/logo";

const columns = [
  {
    heading: "Find a room",
    links: [
      { label: "Browse all rooms", href: routes.rooms },
      { label: "Koramangala", href: routes.locality("bengaluru", "koramangala") },
      { label: "Indiranagar", href: routes.locality("bengaluru", "indiranagar") },
      { label: "HSR Layout", href: routes.locality("bengaluru", "hsr-layout") },
    ],
  },
  {
    heading: "List your room",
    links: [
      { label: "Post a room", href: routes.post },
      { label: "How it works", href: routes.about },
      { label: "Help centre", href: routes.help },
    ],
  },
  {
    heading: "Trust",
    links: [
      { label: "Staying safe", href: routes.safety },
      { label: "Contact us", href: routes.contact },
      { label: "Terms", href: routes.terms },
      { label: "Privacy", href: routes.privacy },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface-muted">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo variant="wide" height={30} href={null} priority={false} />

            <p className="mt-2 max-w-xs text-sm text-ink-muted">
              Rooms for rent, direct from owners. No broker fees, no commission.
            </p>

          </div>

          {columns.map((column) => (
            <div key={column.heading}>
              <h2 className="text-sm font-semibold text-ink">
                {column.heading}
              </h2>

              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-muted hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>

                ))}
              </ul>

            </div>

          ))}
        </div>

        <p className="mt-8 text-xs text-ink-subtle">
          © {new Date().getFullYear()} RoomBazar. Listings are posted by users;
          we are not a party to any rental agreement.
        </p>

      </div>

    </footer>

  );
}
