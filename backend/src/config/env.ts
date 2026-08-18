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
    Mail delivery. Resend is the default primary with SMTP behind it, so one
    provider failing cannot stop people signing up. With neither configured the
    code is written to the log, which keeps local development working without
    credentials and is refused outright in production.
  */
  MAIL_DRIVER: z.preprocess(
    blankAsAbsent,
    z.enum(["resend", "smtp"]).default("resend"),
  ),
  MAIL_FALLBACK: z.preprocess(
    blankAsAbsent,
    z.enum(["on", "off"]).default("on"),
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

  /*
    A hostname, not an address. Putting the account's email here is an easy slip
    and produces a DNS failure at send time, far from the cause.
  */
  SMTP_HOST: z.preprocess(
    blankAsAbsent,
    z
      .string()
      .refine((value) => !value.includes("@"), {
        message: 'must be a hostname such as "smtp.gmail.com", not an email address',
      })
      .optional(),
  ),
  SMTP_PORT: z.preprocess(
    blankAsAbsent,
    z.coerce.number().int().positive().optional(),
  ),
  SMTP_USER: z.preprocess(blankAsAbsent, z.string().optional()),
  SMTP_PASSWORD: z.preprocess(blankAsAbsent, z.string().optional()),

  DATABASE_URL: z.preprocess(blankAsAbsent, z.string().url().optional()),

  /*
    Cloudinary. The secret signs upload requests on this server and must never
    reach the browser; the cloud name and API key are public by design and are
    handed to the client alongside each signature.
  */
  CLOUDINARY_CLOUD_NAME: z.preprocess(blankAsAbsent, z.string().optional()),
  CLOUDINARY_API_KEY: z.preprocess(blankAsAbsent, z.string().optional()),
  CLOUDINARY_API_SECRET: z.preprocess(blankAsAbsent, z.string().optional()),
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
