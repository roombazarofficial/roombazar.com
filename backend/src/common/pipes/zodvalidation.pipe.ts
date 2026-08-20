import { Injectable, type PipeTransform } from "@nestjs/common";
import type { ZodSchema } from "zod";
import { ValidationFailed } from "src/common/errors/domain.errors";

@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const fields: Record<string, string> = {};

      for (const issue of result.error.issues) {
        const path = issue.path.join(".") || "_";
        fields[path] ??= issue.message;
      }

      throw new ValidationFailed("Some details need fixing", fields);
    }

    return result.data;
  }
}
