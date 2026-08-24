/**
 * Formats ISO date string into human readable availability string.
 * Example: '2026-09-01' -> 'Available from Sep 1'
 */
export function formatAvailability(dateStr: string | null | undefined): string {
  if (!dateStr) return "Available now";

  try {
    const target = new Date(dateStr);
    const now = new Date();
    // Clear hours for day comparison
    target.setHours(0, 0, 0, 0);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (target <= today) {
      return "Available now";
    }

    const formatted = target.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });

    return `Available from ${formatted}`;
  } catch {
    return "Available now";
  }
}

const INDIA_TIME_ZONE = "Asia/Kolkata";

export function formatIndiaTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: INDIA_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatIndiaDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: INDIA_TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function relativeTime(iso: string): string {
  const timestamp = new Date(iso).getTime();
  if (!Number.isFinite(timestamp)) return "";

  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1_440) return `${Math.floor(minutes / 60)}h`;
  return `${Math.floor(minutes / 1_440)}d`;
}
