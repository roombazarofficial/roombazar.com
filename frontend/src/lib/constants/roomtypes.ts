import type { Furnishing, PostedBy, RoomType } from "@/types/listing";

export const roomTypeLabels: Record<RoomType, string> = {
  singleroom: "Single room",
  sharedroom: "Shared room",
  pgbed: "PG bed",
  rk1: "1 RK",
  bhk1: "1 BHK",
  bhk2: "2 BHK",
  bhk3plus: "3+ BHK",
  hostelbed: "Hostel bed",
};

export const roomTypeOrder: RoomType[] = [
  "singleroom",
  "sharedroom",
  "pgbed",
  "hostelbed",
  "rk1",
  "bhk1",
  "bhk2",
  "bhk3plus",
];

export const furnishingLabels: Record<Furnishing, string> = {
  unfurnished: "Unfurnished",
  semi: "Semi-furnished",
  full: "Fully furnished",
};

export const postedByLabels: Record<PostedBy, string> = {
  owner: "Owner",
  tenant: "Current tenant",
  agent: "Agent",
};
