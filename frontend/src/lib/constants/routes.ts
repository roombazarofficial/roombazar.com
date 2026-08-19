/**
 * Every internal URL is built here. Nothing else in the app should
 * concatenate a path by hand — when a route moves, this file is the only
 * place that changes.
 */

export const routes = {
  home: "/",

  // Public discovery. These are the pages search engines index, so their
  // shape is fixed by the SEO plan in docs/02-architecture.md.
  rooms: "/rooms",
  city: (city: string) => `/rooms/${city}`,
  locality: (city: string, locality: string) => `/rooms/${city}/${locality}`,
  listing: (slug: string) => `/room/${slug}`,

  // Posting a room.
  post: "/post",
  postStep: (step: PostStep) => `/post/${step}`,

  // Auth.
  login: "/signin",
  signin: "/signin",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verify: "/verify",
  onboarding: "/onboarding",

  dashboard: "/dashboard",
  myListings: "/dashboard/listings",
  myListing: (id: string) => `/dashboard/listings/${id}`,
  editListing: (id: string) => `/dashboard/listings/${id}/edit`,
  listingPhotos: (id: string) => `/dashboard/listings/${id}/photos`,
  inbox: "/dashboard/inbox",
  conversation: (id: string) => `/dashboard/inbox/${id}`,
  saved: "/dashboard/saved",
  savedSearches: "/dashboard/saved/searches",
  profile: "/dashboard/profile",
  verification: "/dashboard/verification",
  settings: "/dashboard/settings",

  admin: "/admin",
  adminModeration: "/admin/moderation",
  adminReports: "/admin/reports",
  adminAuditLog: "/admin/audit-log",

  about: "/about",
  contact: "/contact",
  help: "/help",
  safety: "/safety",
  terms: "/terms",
  privacy: "/privacy",
} as const;

export const postSteps = [
  "basic-details",
  "location",
  "pricing",
  "amenities",
  "photos",
  "rules",
  "availability",
  "preview",
] as const;

export type PostStep = (typeof postSteps)[number];
