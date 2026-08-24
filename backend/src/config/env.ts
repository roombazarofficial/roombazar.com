import { z } from "zod";

const blankAsAbsent = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const schema = z.object({
  NODE_ENV: z.preprocess(
    blankAsAbsent,
    z.enum(["development", "test", "production"]).default("development"),
  ),
  PORT: z.preprocess(
    blankAsAbsent,
    z.coerce.number().int().positive().default(4000),
  ),

  CORS_ORIGINS: z.preprocess(
    blankAsAbsent,
    z
      .string()
      .default("http://localhost:3000")
      .transform((value) =>
        value
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean),
      ),
  ),
  /*
    Share the session with sibling production hosts such as roombazar.com and
    api.roombazar.com. Leave unset locally so the browser uses a host-only
    localhost cookie.
  */
  COOKIE_DOMAIN: z.preprocess(
    blankAsAbsent,
    z
      .string()
      .regex(
        /^\.?[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/i,
        'must be a hostname such as ".roombazar.com", not a URL',
      )
      .optional(),
  ),
  /*
    Must be a bare address or "Name <address>". Providers reject anything else,
    and the failure surfaces at send time as an opaque "invalid from field"
    rather than anywhere near the typo that caused it.
  */
  MAIL_FROM: z.preprocess(
    blankAsAbsent,
    z
      .string()
      .regex(
        /^(?:[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+|[^<>]+<[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+>)$/,
        'must be "address@example.com" or "Name <address@example.com>"',
      )
      .default("RoomBazar <onboarding@resend.dev>"),
  ),

  RESEND_API_KEY: z.preprocess(blankAsAbsent, z.string().optional()),

  DATABASE_URL: z.preprocess(blankAsAbsent, z.string().url().optional()),

  /*
    Cloudinary. The secret signs upload requests on this server and must never
    reach the browser; the cloud name and API key are public by design and are
    handed to the client alongside each signature.
  */
  CLOUDINARY_CLOUD_NAME: z.preprocess(blankAsAbsent, z.string().optional()),
  CLOUDINARY_API_KEY: z.preprocess(blankAsAbsent, z.string().optional()),
  CLOUDINARY_API_SECRET: z.preprocess(blankAsAbsent, z.string().optional()),
  CLOUDINARY_URL: z.preprocess(blankAsAbsent, z.string().optional()),
}).superRefine((env, context) => {
  if (env.NODE_ENV === "production" && !env.RESEND_API_KEY) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["RESEND_API_KEY"],
      message: "is required in production",
    });
  }
});

export type Env = z.infer<typeof schema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = schema.safeParse(raw);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  return result.data;
}
