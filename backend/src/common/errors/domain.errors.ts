import { HttpException, HttpStatus } from "@nestjs/common";

export class DomainError extends HttpException {
  constructor(code: string, message: string, status: HttpStatus) {
    super({ code, message }, status);
  }
}

export class NotFound extends DomainError {
  constructor(what: string) {
    super("notfound", `${what} not found`, HttpStatus.NOT_FOUND);
  }
}

export class Forbidden extends DomainError {
  constructor(message = "You do not have access to this") {
    super("forbidden", message, HttpStatus.FORBIDDEN);
  }
}

export class ValidationFailed extends DomainError {
  constructor(
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super("validationfailed", message, HttpStatus.BAD_REQUEST);

    if (fields) {
      const response = this.getResponse();
      if (typeof response === "object" && response !== null) {
        Object.assign(response, { fields });
      }
    }
  }
}

export class RateLimited extends DomainError {
  constructor(message: string) {
    super("ratelimited", message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

export class InvalidTransition extends DomainError {
  constructor(from: string, to: string) {
    super(
      "invalidtransition",
      `Cannot move from ${from} to ${to}`,
      HttpStatus.CONFLICT,
    );
  }
}

export class TrustLevelTooLow extends DomainError {
  constructor(message: string) {
    super("trustleveltoolow", message, HttpStatus.FORBIDDEN);
  }
}

/**
 * The account is fine but the code could not be delivered.
 *
 * Distinct from a 500 because nothing is broken in the request: retrying, or
 * using a different address, may well work. Surfacing it as a server error
 * would tell the person to give up when they should try again.
 */
export class MailDeliveryFailed extends DomainError {
  constructor() {
    super(
      "maildeliveryfailed",
      "We could not send the email. Check the address and try again.",
      HttpStatus.BAD_GATEWAY,
    );
  }
}
