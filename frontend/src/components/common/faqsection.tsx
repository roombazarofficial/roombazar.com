import { FAQStructuredData } from "./structureddata";

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Renders an FAQ block AND the matching FAQPage JSON-LD from the same array, so
 * the structured data can never claim a question the page does not visibly show.
 * Pass only questions with real, non-templated answers.
 */
export function FaqSection({
  heading = "Frequently asked questions",
  items,
}: {
  heading?: string;
  items: FaqItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-14 border-t border-line pt-8">
      <FAQStructuredData items={items} />
      <h2 className="text-base font-semibold text-ink">{heading}</h2>
      <dl className="mt-4 space-y-5">
        {items.map((item) => (
          <div key={item.question}>
            <dt className="text-sm font-medium text-ink">{item.question}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-ink-muted">
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
