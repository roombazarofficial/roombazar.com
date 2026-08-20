export type AmenityCategory =
  | "utilities"
  | "safety"
  | "convenience"
  | "rules";

export interface Amenity {
  id: string;
  slug: string;
  label: string;
  category: AmenityCategory;
}
