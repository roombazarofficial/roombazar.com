import { Controller, Get, Inject } from "@nestjs/common";
import { Public } from "src/common/decorators/public.decorator";
import { SkipThrottle } from "@nestjs/throttler";
import {
  GEOGRAPHY_REPOSITORY,
  type GeographyRepository,
} from "src/persistence/ports/geography.repository";

@Controller("health")
export class HealthController {
  private readonly startedAt = Date.now();

  constructor(
    @Inject(GEOGRAPHY_REPOSITORY)
    private readonly geography: GeographyRepository,
  ) {}

  @Public()
  @SkipThrottle()
  @Get("live")
  live() {
    return {
      status: "ok",
      uptimeSeconds: Math.round((Date.now() - this.startedAt) / 1000),
    };
  }

  @Public()
  @SkipThrottle()
  @Get("ready")
  async ready() {
    const checks: Record<string, "ok" | "failed"> = {};

    try {
      await this.geography.listCities();
      checks.persistence = "ok";
    } catch {
      checks.persistence = "failed";
    }

    const ready = Object.values(checks).every((value) => value === "ok");

    return { status: ready ? "ready" : "notready", checks };
  }
}
