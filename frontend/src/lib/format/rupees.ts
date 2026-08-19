/**
 * All money in this app is integer paise. These helpers are the only place
 * that converts to rupees for display — no component should divide by 100.
 */

/** ₹15,000 — Indian digit grouping, no decimals. */
export function formatRupees(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

/** ₹15,000/month — the form used on listing cards and rent blocks. */
export function formatMonthlyRent(paise: number): string {
  return `${formatRupees(paise)}/month`;
}

/**
 * ₹15,000 → "₹15K", ₹150,000 → "₹1.5L". For dense surfaces like map pins and
 * filter chips where the full figure will not fit.
 */
export function formatRupeesCompact(paise: number): string {
  const rupees = paise / 100;

  if (rupees >= 10_000_000) {
    return `₹${trimZero(rupees / 10_000_000)}Cr`;
  }
  if (rupees >= 100_000) {
    return `₹${trimZero(rupees / 100_000)}L`;
  }
  if (rupees >= 1_000) {
    return `₹${trimZero(rupees / 1_000)}K`;
  }
  return `₹${rupees}`;
}

/**
 * Listers think in months of rent, the schema stores an absolute amount.
 * Returns null when the deposit is not a clean multiple, so callers can fall
 * back to showing the figure itself.
 */
export function depositInMonths(
  depositPaise: number,
  rentPaise: number,
): number | null {
  if (rentPaise <= 0) return null;

  const months = depositPaise / rentPaise;
  const rounded = Math.round(months * 2) / 2;

  return Math.abs(months - rounded) < 0.01 ? rounded : null;
}

function trimZero(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "");
}
