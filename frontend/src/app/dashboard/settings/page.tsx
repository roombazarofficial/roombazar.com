import Link from "next/link";

const sections = [
  { href: "/dashboard/settings/account", title: "Account", description: "Your phone number, email and language." },
  { href: "/dashboard/settings/notifications", title: "Notifications", description: "What we message you about, and how often." },
  { href: "/dashboard/settings/sessions", title: "Signed-in devices", description: "Review where you are signed in and sign out remotely." },
];

export default function Page() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Settings
      </h1>

      <ul className="mt-6 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
        {sections.map((section) => (
          <li key={section.href}>
            <Link
              href={section.href}
              className="block p-4 transition-colors hover:bg-surface-muted"
            >
              <p className="text-sm font-medium text-ink">{section.title}</p>

              <p className="mt-0.5 text-sm text-ink-muted">
                {section.description}
              </p>

            </Link>

          </li>

        ))}
      </ul>

      <div className="mt-8 rounded-card border border-danger/20 bg-danger-soft p-4">
        <h2 className="text-sm font-semibold text-danger">Delete account</h2>

        <p className="mt-1 text-sm text-danger">
          Removes your account, listings and photos within 30 days. Messages
          that are evidence in an open report are anonymised rather than
          deleted.
        </p>

        <button className="mt-3 rounded-control border border-danger/30 px-3 py-2 text-sm font-medium text-danger hover:bg-danger/10">
          Delete my account
        </button>

      </div>

    </div>

  );
}
