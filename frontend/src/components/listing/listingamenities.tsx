import { cn } from "@/lib/utils/classnames";
import type { Amenity, AmenityCategory } from "@/types/amenity";

const categoryLabels: Record<AmenityCategory, string> = {
  utilities: "Utilities",
  safety: "Safety",
  convenience: "Convenience",
  rules: "House rules",
};

const categoryOrder: AmenityCategory[] = [
  "utilities",
  "convenience",
  "safety",
  "rules",
];

/**
 * Grouped rather than a flat list. House rules in particular need to be
 * findable — whether non-veg is allowed or there is a gate-closing time
 * decides the room for a lot of seekers.
 */
export function ListingAmenities({
  amenities,
  className,
}: {
  amenities: Amenity[];
  className?: string;
}) {
  if (amenities.length === 0) return null;

  return (
    <section className={cn(className)}>
      <h2 className="text-base font-semibold text-ink">
        Amenities and rules
      </h2>

      <div className="mt-3 space-y-5">
        {categoryOrder.map((category) => {
          const group = amenities.filter((item) => item.category === category);
          if (group.length === 0) return null;

          return (
            <div key={category}>
              <h3 className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
                {categoryLabels[category]}
              </h3>
              <ul className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
                {group.map((amenity) => (
                  <li key={amenity.id} className="text-sm text-ink">
                    {amenity.label}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
