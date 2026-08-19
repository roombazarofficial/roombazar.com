import type { TenantPreference } from "@/types/listing";

/**
 * The complete set of tenant preferences a lister may express. There is no
 * "other" and no free-text escape hatch — see docs/03-trust-and-safety.md.
 */
export const tenantPreferenceLabels: Record<TenantPreference, string> = {
  any: "Anyone",
  family: "Families",
  workingprofessional: "Working professionals",
  student: "Students",
  bachelormale: "Bachelors (men)",
  bachelorfemale: "Bachelors (women)",
};
