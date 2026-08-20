import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import { createTransport, type Transporter } from "nodemailer";

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

type Driver = "resend" | "smtp";

/**
 * Sends transactional mail through Resend, with SMTP behind it.
 *
 * Two providers rather than one because a verification code is the only thing
 * standing between a new user and an account: if the mail does not arrive,
 * nobody can sign up at all. A provider outage would otherwise take the whole
 * product down, and OTP mail is not something that can be queued for later —
 * the code expires in ten minutes.
 *
 * MAIL_DRIVER picks the primary. The other is used automatically when the
 * primary fails, and MAIL_FALLBACK=off disables that.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly smtp: Transporter | null;
  private readonly primary: Driver;
  private readonly fallbackEnabled: boolean;
  private readonly from: string;
  private readonly smtpFrom: string;
  private readonly providerConfigured: boolean;

  constructor(private readonly config: ConfigService) {
    const resendKey = config.get<string>("RESEND_API_KEY");
    this.resend = resendKey ? new Resend(resendKey) : null;

    const host = config.get<string>("SMTP_HOST");
    const smtpUser = config.get<string>("SMTP_USER");
    this.smtp = host
      ? createTransport({
          host,
          port: config.get<number>("SMTP_PORT") ?? 587,
          secure: (config.get<number>("SMTP_PORT") ?? 587) === 465,
          auth: {
            user: smtpUser ?? "",
            pass: config.get<string>("SMTP_PASSWORD") ?? "",
          },
        })
      : null;

    this.primary = (config.get<string>("MAIL_DRIVER") as Driver) ?? "resend";
    this.fallbackEnabled = config.get<string>("MAIL_FALLBACK") !== "off";
    this.from = config.get<string>("MAIL_FROM") ?? "RoomBazar <onboarding@resend.dev>";
    this.smtpFrom = smtpUser
      ? `RoomBazar <${smtpUser}>`
      : this.from;

    /*
      Never report a successful delivery when no provider exists. The client
      must stay on the current form and show the delivery error instead of
      sending someone to an OTP screen for a message that was never sent.
    */
    this.providerConfigured = Boolean(this.resend || this.smtp);

    if (!this.providerConfigured) {
      if (config.get<string>("NODE_ENV") === "production") {
        throw new Error(
          "No mail provider configured. Set RESEND_API_KEY or SMTP_HOST.",
        );
      }

      this.logger.warn(
        "No mail provider configured. Email requests will fail until RESEND_API_KEY or SMTP settings are added.",
      );
    }
  }

  async send(mail: Mail): Promise<void> {
    if (!this.providerConfigured) {
      throw new Error("No mail provider configured");
    }

    const order: Driver[] =
      this.primary === "resend" ? ["resend", "smtp"] : ["smtp", "resend"];

    const attempts = this.fallbackEnabled ? order : [order[0] as Driver];
    let lastError: unknown = null;

    for (const driver of attempts) {
      try {
        if (driver === "resend" && this.resend) {
          await this.sendWithResend(mail);
          return;
        }

        if (driver === "smtp" && this.smtp) {
          const result = await this.smtp.sendMail({
            from: this.smtpFrom,
            to: mail.to,
            subject: mail.subject,
            html: mail.html,
            text: mail.text,
          });

          if (result.rejected.length > 0 || result.accepted.length === 0) {
            throw new Error(
              `SMTP rejected the recipient: ${result.response || "not accepted"}`,
            );
          }

          this.logger.log(`SMTP accepted message ${result.messageId}`);
          return;
        }
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `${driver} delivery failed: ${
            error instanceof Error ? error.message : "unknown error"
          }`,
        );
      }
    }

    throw new Error(
      `Could not send mail: ${
        lastError instanceof Error ? lastError.message : "no provider available"
      }`,
    );
  }

  private async sendWithResend(mail: Mail): Promise<void> {
    if (!this.resend) throw new Error("Resend is not configured");

    const { error } = await this.resend.emails.send({
      from: this.from,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });

    // The SDK reports failures in the payload rather than by throwing, so a
    // returned error has to be raised for the fallback to engage.
    if (error) throw new Error(error.message);
  }
}
