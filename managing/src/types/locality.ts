export interface Locality {
  id: string;
  name: string;
  slug: string;
  cityId: string;
  citySlug: string;
  aliases: string[];
  activeListingCount: number;
  medianRentPaise: number | null;
}
