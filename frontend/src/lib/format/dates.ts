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
