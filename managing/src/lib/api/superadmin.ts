import type { Listing, ListingStatus } from "@/types/listing";
import type { Report } from "@/types/report";

const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${base}/api/superadmin${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { code?: string; message?: string }
      | null;

    throw new SuperAdminError(
      body?.message ?? `Request failed (${response.status})`,
      response.status,
      body?.code,
    );
  }

  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

export class SuperAdminError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "SuperAdminError";
  }
}


export interface DashboardSummary {
  needsAction: {
    pendingApproval: number;
    openReports: number;
    oldestPendingHours: number;
  };
  listings: Record<ListingStatus, number>;
  staff: { superAdmins: number; admins: number; moderators: number };
}

export const getDashboard = () => request<DashboardSummary>("/dashboard");


export interface ApprovalRow {
  listing: Listing;
  ownerId: string;
  ownerName: string;
  ownerTrustLevel: string;
  ownerJoinedAt: string;
  flags: string[];
  waitingHours: number;
}

export interface Paged<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export const getApprovalQueue = (page = 1) =>
  request<Paged<ApprovalRow>>(`/approvals?page=${page}`);

export const getApproval = (id: string) =>
  request<ApprovalRow>(`/approvals/${id}`);

export const approveListing = (id: string, note = "") =>
  request<Listing>(`/approvals/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });

export const rejectListing = (id: string, reason: string) =>
  request<Listing>(`/approvals/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

export const suspendListing = (id: string, reason: string) =>
  request<Listing>(`/approvals/${id}/suspend`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

export const reinstateListing = (id: string, note = "") =>
  request<Listing>(`/approvals/${id}/reinstate`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });

export const approveMany = (listingIds: string[]) =>
  request<{
    approved: number;
    failed: number;
    outcomes: { listingId: string; ok: boolean; error?: string }[];
  }>("/approvals/bulk/approve", {
    method: "POST",
    body: JSON.stringify({ listingIds }),
  });


export interface AdminListingRow {
  listing: Listing;
  ownerId: string;
  ownerName: string;
}

export const getListings = (params: Record<string, string | number> = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  );

  return request<Paged<AdminListingRow>>(`/listings?${query}`);
};

export const getListingCounts = () =>
  request<Record<string, number>>("/listings/counts");

export interface AdminListingDetail {
  listing: Listing & { cityId: string; localityId: string };
  owner: {
    id: string;
    name: string;
    publicEmail: string;
    publicPhone: string | null;
    trustLevel: string;
    joinedAt: string;
  } | null;
  reportCount: number;
}

export const getListing = (id: string) =>
  request<AdminListingDetail>(`/listings/${id}`);

export const editListing = (
  id: string,
  patch: Record<string, unknown> & { reason: string },
) =>
  request<Listing>(`/listings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });

export const deleteListing = (id: string) =>
  request<void>(`/listings/${id}`, { method: "DELETE" });


export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "user" | "moderator" | "admin" | "superadmin";
  trustLevel: "new" | "verified" | "trusted" | "restricted";
  createdAt: string;
  deletedAt: string | null;
}

export const getUsers = (params: Record<string, string | number> = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  );

  return request<Paged<AdminUser>>(`/users?${query}`);
};

export interface AdminUserDetail {
  user: AdminUser;
  publicEmail: string;
  publicPhone: string | null;
  limits: Record<string, number | boolean>;
  listingCounts: Record<string, number>;
  reportCount: number;
}

export const getUser = (id: string) =>
  request<AdminUserDetail>(`/users/${id}`);

export const setUserRole = (id: string, role: string, reason: string) =>
  request<AdminUser>(`/users/${id}/role`, {
    method: "POST",
    body: JSON.stringify({ role, reason }),
  });

export const setUserTrustLevel = (
  id: string,
  trustLevel: string,
  reason: string,
) =>
  request<AdminUser>(`/users/${id}/trustlevel`, {
    method: "POST",
    body: JSON.stringify({ trustLevel, reason }),
  });

export const deleteUser = (id: string) =>
  request<void>(`/users/${id}`, { method: "DELETE" });


export interface AdminCity {
  id: string;
  name: string;
  slug: string;
  state: string;
  isActive: boolean;
  centroidLat: number;
  centroidLng: number;
}

export interface AdminLocality {
  id: string;
  cityId: string;
  name: string;
  slug: string;
  aliases: string[];
  centroidLat: number;
  centroidLng: number;
}

export interface AdminAmenity {
  id: string;
  slug: string;
  label: string;
  category: "utilities" | "safety" | "convenience" | "rules";
}

export const getCities = () => request<AdminCity[]>("/geography/cities");

export const createCity = (city: Omit<AdminCity, "id">) =>
  request<AdminCity>("/geography/cities", {
    method: "POST",
    body: JSON.stringify(city),
  });

export const updateCity = (id: string, patch: Partial<AdminCity>) =>
  request<AdminCity>(`/geography/cities/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });

export const deleteCity = (id: string) =>
  request<void>(`/geography/cities/${id}`, { method: "DELETE" });

export const getLocalities = (cityId: string) =>
  request<AdminLocality[]>(`/geography/cities/${cityId}/localities`);

export const createLocality = (locality: Omit<AdminLocality, "id">) =>
  request<AdminLocality>("/geography/localities", {
    method: "POST",
    body: JSON.stringify(locality),
  });

export const updateLocality = (id: string, patch: Partial<AdminLocality>) =>
  request<AdminLocality>(`/geography/localities/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });

export const deleteLocality = (id: string) =>
  request<void>(`/geography/localities/${id}`, { method: "DELETE" });

export const getAmenities = () =>
  request<AdminAmenity[]>("/geography/amenities");

export const createAmenity = (amenity: Omit<AdminAmenity, "id">) =>
  request<AdminAmenity>("/geography/amenities", {
    method: "POST",
    body: JSON.stringify(amenity),
  });

export const updateAmenity = (id: string, patch: Partial<AdminAmenity>) =>
  request<AdminAmenity>(`/geography/amenities/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });

export const deleteAmenity = (id: string) =>
  request<void>(`/geography/amenities/${id}`, { method: "DELETE" });


export interface AuditEntry {
  id: string;
  moderatorId: string;
  moderatorName: string;
  targetType: string;
  targetId: string;
  action: string;
  note: string;
  createdAt: string;
}

export const getAuditLog = (limit = 100) =>
  request<AuditEntry[]>(`/auditlog?limit=${limit}`);

export const getOpenReports = () => request<Report[]>("/reports");

export const getReport = (id: string) => request<Report>(`/reports/${id}`);

export const resolveReport = (
  id: string,
  outcome: "upheld" | "dismissed",
  note: string,
) =>
  request<Report>(`/reports/${id}/resolve`, {
    method: "POST",
    body: JSON.stringify({ outcome, note }),
  });

export interface VerificationRequest {
  id: string;
  userId: string;
  kind: "phone" | "email" | "governmentid" | "ownership";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    trustLevel: string;
  };
}

export const getVerificationRequests = () =>
  request<VerificationRequest[]>("/verifications");

export const decideVerification = (
  id: string,
  decision: "approved" | "rejected",
  note: string,
) =>
  request(`/verifications/${id}/decision`, {
    method: "POST",
    body: JSON.stringify({ decision, note }),
  });

export interface LocalityRequest {
  id: string;
  cityId: string;
  requestedBy: string;
  name: string;
  createdAt: string;
  city: {
    id: string;
    name: string;
    slug: string;
    centroidLat: number;
    centroidLng: number;
  } | null;
}

export const getLocalityRequests = () =>
  request<LocalityRequest[]>("/localityrequests");

export const decideLocalityRequest = (
  id: string,
  decision: "approved" | "rejected",
  note: string,
) =>
  request(`/localityrequests/${id}/decision`, {
    method: "POST",
    body: JSON.stringify({ decision, note }),
  });
