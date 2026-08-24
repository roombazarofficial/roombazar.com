import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/** Sends signup codes, password-reset codes and notifications through Resend. */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const resendKey = config.get<string>("RESEND_API_KEY");
    this.resend = resendKey ? new Resend(resendKey) : null;
    this.from =
      config.get<string>("MAIL_FROM") ??
      "RoomBazar <onboarding@resend.dev>";

    if (!this.resend) {
      this.logger.warn(
        "Resend is not configured. Email requests will fail until RESEND_API_KEY is set.",
      );
    }
  }

  async send(mail: Mail): Promise<void> {
    if (!this.resend) throw new Error("Resend is not configured");

    const { data, error } = await this.resend.emails.send({
      from: this.from,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });

    if (error) {
      this.logger.warn(`Resend delivery failed: ${error.message}`);
      throw new Error(`Could not send mail: ${error.message}`);
    }

    this.logger.log(`Resend accepted message ${data?.id ?? "unknown"}`);
  }
}
