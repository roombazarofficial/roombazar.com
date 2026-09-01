const TRUST_ITEMS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    title: "Direct from owners",
    desc: "Talk directly to property owners — no middlemen involved.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: "No hidden broker fees",
    desc: "What you see is what you pay. Transparent pricing always.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Safe in-app messaging",
    desc: "Message hosts securely without sharing your personal number.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: "Verified listings",
    desc: "Every listing is reviewed before going live on RoomBazar.",
  },
];

export function TrustStrip() {
  return (
    <section className="border-y border-line bg-surface-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        {/* Heading */}
        <div className="mb-6 text-center sm:mb-8">
          <p className="text-2xs font-bold uppercase tracking-widest text-brand-600">
            Why RoomBazar?
          </p>
          <h2 className="mt-1 text-lg font-bold tracking-tight text-ink sm:text-2xl">
            Built for trust
          </h2>
        </div>

        {/* Items — 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-4">
          {TRUST_ITEMS.map((item, i) => (
            <div
              key={item.title}
              className={`flex flex-col items-center text-center animate-fade-up stagger-${Math.min(i + 1, 6)}`}
            >
              {/* Icon circle */}
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 mb-3">
                {item.icon}
              </div>
              <h3 className="text-xs font-bold text-ink sm:text-sm">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted sm:text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

