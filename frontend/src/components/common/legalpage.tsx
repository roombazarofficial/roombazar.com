export function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">
        {title}
      </h1>

      <p className="mt-2 text-xs text-ink-subtle">
        Last updated {lastUpdated}
      </p>

      <div className="mt-8 space-y-4 text-sm leading-relaxed text-ink-muted">
        {children}
      </div>

    </article>

  );
}
