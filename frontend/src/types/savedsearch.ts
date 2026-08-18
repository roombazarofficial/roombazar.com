export interface SavedSearch {
  id: string;
  userId: string;
  label: string;
  query: string;
  notifyFrequency: "off" | "daily" | "instant";
  createdAt: string;
}
