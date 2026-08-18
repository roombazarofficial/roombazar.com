"use client";

import { useEffect, useState } from "react";
import { getAmenities } from "@/lib/api/geography";
import type { Amenity } from "@/types/amenity";

export function useAmenities(): Amenity[] {
  const [amenities, setAmenities] = useState<Amenity[]>([]);

  useEffect(() => {
    let active = true;

    getAmenities().then((result) => {
      if (active) setAmenities(result);
    });

    return () => {
      active = false;
    };
  }, []);

  return amenities;
}
