import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils";
import type { Logger } from "@medusajs/framework/types";
import type { NotificationTypes } from "@medusajs/framework/types";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

type InjectedDependencies = {
  logger: Logger;
};

type SmtpOptions = {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  from?: string;
  reply_to?: string;
};

export class SmtpNotificationService extends AbstractNotificationProviderService {
  static identifier = "smtp";

  private transporter: Transporter;
  private options: SmtpOptions;
  private logger: Logger;

  constructor({ logger }: InjectedDependencies, options: SmtpOptions) {
    super();
    this.logger = logger;
    this.options = options;

    this.transporter = nodemailer.createTransport({
      host: options.host,
      port: options.port ?? 587,
      secure: options.secure ?? false,
      auth:
        options.user && options.pass
          ? { user: options.user, pass: options.pass }
          : undefined,
    });
  }

  static validateOptions(options: Record<string, any>) {
    if (!options.host) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "SMTP host is required in the provider's options.",
      );
    }
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO,
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    const content = notification.content as
      | { subject?: string; html?: string; text?: string }
      | undefined;

    if (!content) {
      this.logger.warn("[smtp] No content in notification, skipping");
      return {};
    }

    const mailOptions = {
      from: this.options.from ?? this.options.user,
      replyTo: this.options.reply_to ?? undefined,
      to: notification.to,
      subject: content.subject ?? "(no subject)",
      html: content.html,
      text: content.text,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.info(`[smtp] Email sent: ${info.messageId}`);
      return { id: info.messageId };
    } catch (err: any) {
      this.logger.error(`[smtp] Failed to send email: ${err?.message}`);
      throw err;
    }
  }
}
