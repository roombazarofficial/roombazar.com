import { Throttle } from "@nestjs/throttler";

export const ThrottleContact = () =>
  Throttle({ default: { ttl: 60_000, limit: 5 } });

export const ThrottleMessage = () =>
  Throttle({ default: { ttl: 60_000, limit: 20 } });

export const ThrottleReport = () =>
  Throttle({ default: { ttl: 60_000, limit: 6 } });

export const ThrottleUpload = () =>
  Throttle({ default: { ttl: 60_000, limit: 15 } });

export const ThrottleListingCreate = () =>
  Throttle({ default: { ttl: 60_000, limit: 4 } });

export const ThrottleWebhook = () =>
  Throttle({ default: { ttl: 60_000, limit: 300 } });

export const ThrottleReview = () =>
  Throttle({ default: { ttl: 60_000, limit: 6 } });

export const ThrottleFeedback = () =>
  Throttle({ default: { ttl: 60_000, limit: 6 } });
