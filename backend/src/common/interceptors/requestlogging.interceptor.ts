import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { tap, type Observable } from "rxjs";
import type { Response } from "express";
import type { AuthedRequest } from "src/common/guards/session.guard";

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("Request");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<AuthedRequest>();
    const response = http.getResponse<Response>();

    const requestId =
      (request.headers["x-request-id"] as string | undefined) ?? randomUUID();

    request.headers["x-request-id"] = requestId;
    response.setHeader("x-request-id", requestId);

    const startedAt = process.hrtime.bigint();

    return next.handle().pipe(
      tap({
        next: () => this.log(request, response, requestId, startedAt),
        error: () => this.log(request, response, requestId, startedAt),
      }),
    );
  }

  private log(
    request: AuthedRequest,
    response: Response,
    requestId: string,
    startedAt: bigint,
  ): void {
    const ms = Number(process.hrtime.bigint() - startedAt) / 1e6;

    this.logger.log(
      [
        requestId,
        request.method,
        request.route?.path ?? request.path,
        response.statusCode,
        `${ms.toFixed(1)}ms`,
        request.user ? `user=${request.user.id}` : "anon",
      ].join(" "),
    );
  }
}
