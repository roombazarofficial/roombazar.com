export interface State {
  id: string;
  name: string;
  code: string;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  state: string;
  isActive: boolean;
  centroidLat: number;
  centroidLng: number;
}

export interface Locality {
  id: string;
  cityId: string;
  name: string;
  slug: string;
  aliases: string[];
  centroidLat: number;
  centroidLng: number;
}

export interface Amenity {
  id: string;
  slug: string;
  label: string;
  category: "utilities" | "safety" | "convenience" | "rules";
}
