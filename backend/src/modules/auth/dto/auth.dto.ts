import { z } from "zod";

/*
  Normalising here rather than at the database means one spelling of an address
  reaches every layer: nobody ends up with two accounts differing only by case
  or a stray space.
*/
const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.")
  .max(254);

export const startSignupSchema = z.object({ email });
export type StartSignupDto = z.infer<typeof startSignupSchema>;

export const completeSignupSchema = z.object({
  email,
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code."),
  password: z.string().min(6).max(200),
  name: z.string().trim().min(2, "Tell us your name.").max(80),
});
export type CompleteSignupDto = z.infer<typeof completeSignupSchema>;

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});
export type LoginDto = z.infer<typeof loginSchema>;

/**
 * Tells the client which of the two forms to show next, so the person types
 * their address once rather than choosing between sign in and sign up first.
 */
export const lookupSchema = z.object({ email });
export type LookupDto = z.infer<typeof lookupSchema>;

export const requestResetSchema = z.object({ email });
export type RequestResetDto = z.infer<typeof requestResetSchema>;

export const confirmResetSchema = z.object({
  email,
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code."),
  password: z.string().min(6).max(200),
});
export type ConfirmResetDto = z.infer<typeof confirmResetSchema>;
