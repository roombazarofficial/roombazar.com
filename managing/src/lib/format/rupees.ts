export function formatRupees(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export function formatMonthlyRent(paise: number): string {
  return `${formatRupees(paise)}/month`;
}
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
