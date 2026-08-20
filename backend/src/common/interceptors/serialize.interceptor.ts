import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { map, type Observable } from "rxjs";

const NEVER_SERIALISE = new Set([
  "addressLine",
  "lat",
  "lng",
  "phone",
  "phoneVerifiedAt",
  "passwordHash",
  "tokenHash",
  "body",
]);

const EXPLICIT_PREFIX = "public";
const LITERAL_PUBLIC_FIELDS = new Set(["publicId"]);

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((value) => strip(value)));
  }
}

function strip(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(strip);

  if (value === null || typeof value !== "object") return value;

  if (value instanceof Date || Buffer.isBuffer(value)) return value;

  const output: Record<string, unknown> = {};

  for (const [key, nested] of Object.entries(value)) {
    if (NEVER_SERIALISE.has(key)) continue;

    if (LITERAL_PUBLIC_FIELDS.has(key)) {
      output[key] = strip(nested);
      continue;
    }

    if (key.startsWith(EXPLICIT_PREFIX) && key.length > EXPLICIT_PREFIX.length) {
      const rest = key.slice(EXPLICIT_PREFIX.length);
      const unwrapped = rest.charAt(0).toLowerCase() + rest.slice(1);
      output[unwrapped] = strip(nested);
      continue;
    }

    output[key] = strip(nested);
  }

  return output;
}
