import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes so a caller's className always wins over a
 * component's defaults. Without twMerge, `<Button className="bg-white">`
 * would produce "bg-brand-600 bg-white" and the winner depends on stylesheet
 * order rather than intent.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
