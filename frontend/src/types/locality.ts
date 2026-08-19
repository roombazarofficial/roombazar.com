export interface Locality {
  id: string;
  name: string;
  slug: string;
  cityId: string;
  citySlug: string;
  /**
   * Alternate spellings that must resolve to this locality. Without these,
   * "Indiranagar" and "Indira Nagar" fragment search and both sides of the
   * market stop finding each other.
   */
  aliases: string[];
  activeListingCount: number;
  medianRentPaise: number | null;
}
