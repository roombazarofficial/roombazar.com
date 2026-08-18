import type { TenantPreference } from "@/types/listing";

export const tenantPreferenceLabels: Record<TenantPreference, string> = {
  any: "Anyone",
  family: "Families",
  workingprofessional: "Working professionals",
  student: "Students",
  bachelormale: "Bachelors (men)",
  bachelorfemale: "Bachelors (women)",
};
