import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      response
        .status(status)
        .json(
          typeof payload === "object" && payload !== null
            ? payload
            : { code: "error", message: String(payload) },
        );
      return;
    }

    this.logger.error(
      exception instanceof Error ? exception.message : "Unknown error",
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: "internalerror",
      message: "Something went wrong on our side",
    });
  }
}
