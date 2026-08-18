import { Body, Controller, Post } from "@nestjs/common";
import { z } from "zod";
import { CurrentUser } from "src/common/decorators/currentuser.decorator";
import { ThrottleReport } from "src/common/decorators/throttle.decorator";
import { ZodValidationPipe } from "src/common/pipes/zodvalidation.pipe";
import type { User } from "src/domain/user.entity";
import { ReportsService } from "./reports.service";

const createReportSchema = z.object({
  targetType: z.enum(["listing", "user", "message"]),
  targetId: z.string().min(1),
  reason: z.enum([
    "alreadytaken",
    "scam",
    "wronginfo",
    "duplicate",
    "notowner",
    "discriminatory",
    "offensive",
    "other",
  ]),
  detail: z.string().trim().max(500).nullable().default(null),
});

@Controller("reports")
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @ThrottleReport()
  @Post()
  async create(
    @Body(new ZodValidationPipe(createReportSchema))
    dto: z.infer<typeof createReportSchema>,
    @CurrentUser() user: User,
  ) {
    return this.reports.create(user, dto);
  }
}
