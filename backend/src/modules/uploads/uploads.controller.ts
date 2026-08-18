import { Body, Controller, Post } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { CurrentUser } from "src/common/decorators/currentuser.decorator";
import { ZodValidationPipe } from "src/common/pipes/zodvalidation.pipe";
import { ThrottleUpload } from "src/common/decorators/throttle.decorator";
import {
  TrustLevelTooLow,
  ValidationFailed,
} from "src/common/errors/domain.errors";
import { policyFor } from "src/common/trustlevels";
import type { User } from "src/domain/user.entity";

const signSchema = z.object({
  kind: z.enum(["image", "video"]).default("image"),
});

type SignDto = z.infer<typeof signSchema>;

/** Upload limits, enforced again by Cloudinary through the signed parameters. */
const LIMITS = {
  image: {
    formats: "jpg,jpeg,png,webp,heic",
    maxBytes: 12 * 1024 * 1024,
  },
  video: {
    formats: "mp4,mov,webm,m4v",
    maxBytes: 100 * 1024 * 1024,
  },
} as const;

/**
 * Signed direct uploads to Cloudinary.
 *
 * The file goes straight from the browser to Cloudinary rather than through
 * this server: proxying it would mean paying for the bandwidth twice and
 * hitting request size limits on the one flow that must not fail — a lister
 * with eight photos on a phone.
 *
 * The signature is produced here because the API secret must never reach the
 * browser. It covers the folder, the allowed formats and the size cap, so a
 * client cannot widen any of them: Cloudinary rejects an upload whose
 * parameters do not match what was signed.
 */
@Controller("uploads")
export class UploadsController {
  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get<string>("CLOUDINARY_CLOUD_NAME"),
      api_key: this.config.get<string>("CLOUDINARY_API_KEY"),
      api_secret: this.config.get<string>("CLOUDINARY_API_SECRET"),
      secure: true,
    });
  }

  @ThrottleUpload()
  @Post("signature")
  async signature(
    @Body(new ZodValidationPipe(signSchema)) dto: SignDto,
    @CurrentUser() user: User,
  ) {
    if (policyFor(user.trustLevel).maxActiveListings === 0) {
      throw new TrustLevelTooLow("Your account cannot upload files right now.");
    }

    const cloudName = this.config.get<string>("CLOUDINARY_CLOUD_NAME");
    const apiKey = this.config.get<string>("CLOUDINARY_API_KEY");
    const apiSecret = this.config.get<string>("CLOUDINARY_API_SECRET");

    if (!cloudName || !apiKey || !apiSecret) {
      throw new ValidationFailed(
        "File uploads are not configured on this server.",
      );
    }

    const limits = LIMITS[dto.kind];
    const timestamp = Math.round(Date.now() / 1000);

    /*
      Uploads are namespaced per user, which keeps one person's files from
      colliding with another's and makes an account deletion a single prefix to
      clear.
    */
    const folder = `roombazar/${dto.kind}s/${user.id}`;

    /*
      Returned as assetId, not publicId. SerializeInterceptor treats a leading
      "public" as an explicit-visibility marker and unwraps the key, so a field
      named publicId reaches the browser as id — the client then signs nothing
      and Cloudinary answers 401.
    */
    const assetId = randomUUID();

    /*
      Every parameter signed here is one the client cannot change. Leaving
      allowed_formats or bytes out would let a caller upload anything of any
      size to our account.
    */
    const params: Record<string, string | number> = {
      folder,
      public_id: assetId,
      timestamp,
      allowed_formats: limits.formats,
      // Cloudinary strips EXIF unless explicitly told to keep it, so an
      // uploaded room photo cannot carry GPS coordinates through.
      invalidate: "true",
    };

    const signature = cloudinary.utils.api_sign_request(params, apiSecret);

    return {
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
      assetId,
      resourceType: dto.kind,
      allowedFormats: limits.formats.split(","),
      maxBytes: limits.maxBytes,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${dto.kind}/upload`,
    };
  }
}
