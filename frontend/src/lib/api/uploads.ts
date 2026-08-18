import { api } from "./client";

export type MediaKind = "image" | "video";

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  /** Cloudinary's public_id, named to survive the API's serializer. */
  assetId: string;
  resourceType: MediaKind;
  allowedFormats: string[];
  maxBytes: number;
  uploadUrl: string;
}

/** What the wizard keeps for each finished upload, and what publish sends back. */
export interface UploadedMedia {
  publicId: string;
  secureUrl: string;
  kind: MediaKind;
  format: string;
  width: number;
  height: number;
  sizeBytes: number;
  durationSeconds: number | null;
}

export function requestSignature(kind: MediaKind): Promise<UploadSignature> {
  return api.post<UploadSignature>("/uploads/signature", { kind });
}

export function kindOf(file: File): MediaKind {
  return file.type.startsWith("video/") ? "video" : "image";
}

/**
 * Uploads one file straight to Cloudinary.
 *
 * XMLHttpRequest rather than fetch, because fetch cannot report upload
 * progress — and without progress a slow phone upload looks identical to a
 * frozen one, which is exactly how the previous placeholder behaved.
 */
export function uploadToCloudinary(
  file: File,
  signature: UploadSignature,
  onProgress: (percent: number) => void,
): Promise<UploadedMedia> {
  return new Promise((resolve, reject) => {
    /*
      Every signed field must be present and a string. A missing one used to be
      appended as the literal "undefined", which Cloudinary rejects with a bare
      401 that says nothing about which field was wrong.
    */
    const required = [
      "cloudName",
      "apiKey",
      "timestamp",
      "signature",
      "folder",
      "assetId",
      "uploadUrl",
    ] as const;

    const missing = required.filter(
      (field) =>
        signature[field] === undefined ||
        signature[field] === null ||
        signature[field] === "",
    );

    if (missing.length > 0) {
      reject(
        new Error(
          `Upload could not start: the server left out ${missing.join(", ")}.`,
        ),
      );
      return;
    }

    const form = new FormData();

    /*
      Every field here must match what the server signed. Cloudinary rejects
      the upload outright if any signed parameter differs, which is what stops
      a client widening the format or size limits.
    */
    form.append("file", file);
    form.append("api_key", signature.apiKey);
    form.append("timestamp", String(signature.timestamp));
    form.append("signature", signature.signature);
    form.append("folder", signature.folder);
    form.append("public_id", signature.assetId);
    form.append("allowed_formats", signature.allowedFormats.join(","));
    form.append("invalidate", "true");

    const request = new XMLHttpRequest();
    request.open("POST", signature.uploadUrl, true);

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        reject(new Error(readError(request.responseText)));
        return;
      }

      try {
        const body = JSON.parse(request.responseText) as CloudinaryResponse;

        resolve({
          publicId: body.public_id,
          secureUrl: body.secure_url,
          kind: body.resource_type === "video" ? "video" : "image",
          format: body.format ?? "",
          width: body.width ?? 0,
          height: body.height ?? 0,
          sizeBytes: body.bytes ?? file.size,
          durationSeconds: body.duration ?? null,
        });
      } catch {
        reject(new Error("Upload finished but the response could not be read."));
      }
    };

    request.onerror = () =>
      reject(new Error("Upload failed. Check your connection and try again."));
    request.onabort = () => reject(new Error("Upload cancelled."));
    request.ontimeout = () => reject(new Error("Upload timed out."));

    // Generous, because a video on a slow mobile connection is legitimately
    // slow. The progress bar is what tells the user it is still moving.
    request.timeout = 10 * 60 * 1000;

    request.send(form);
  });
}

interface CloudinaryResponse {
  public_id: string;
  secure_url: string;
  resource_type: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  duration?: number;
}

function readError(body: string): string {
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } };
    return parsed.error?.message ?? "Upload was rejected.";
  } catch {
    return "Upload was rejected.";
  }
}
