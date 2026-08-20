import { Body, Controller, Get, Inject, Param, Post } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { CurrentUser } from "src/common/decorators/currentuser.decorator";
import { SuperAdminOnly } from "src/common/decorators/superadmin.decorator";
import { NotFound } from "src/common/errors/domain.errors";
import { ZodValidationPipe } from "src/common/pipes/zodvalidation.pipe";
import type { User } from "src/domain/user.entity";
import {
  REPORTS_REPOSITORY,
  type ReportsRepository,
} from "src/persistence/ports/reports.repository";
import { PrismaService } from "src/persistence/prisma/prisma.service";

const decisionSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  name: z.string().trim().min(2).max(100).optional(),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  centroidLat: z.number().min(6).max(38).optional(),
  centroidLng: z.number().min(68).max(98).optional(),
  note: z.string().trim().min(3).max(500),
});

@Controller("superadmin/localityrequests")
@SuperAdminOnly()
export class AdminLocalityRequestsController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REPORTS_REPOSITORY) private readonly reports: ReportsRepository,
  ) {}

  @Get()
  async list() {
    const requests = await this.prisma.localityRequest.findMany({
      where: { resolved: false },
      orderBy: { createdAt: "asc" },
    });
    const cityIds = [...new Set(requests.map((request) => request.cityId))];
    const cities = await this.prisma.city.findMany({
      where: { id: { in: cityIds } },
      select: { id: true, name: true, slug: true, centroidLat: true, centroidLng: true },
    });
    const byId = new Map(cities.map((city) => [city.id, city]));
    return requests.map((request) => ({ ...request, city: byId.get(request.cityId) ?? null }));
  }

  @Post(":id/decision")
  async decide(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(decisionSchema))
    dto: z.infer<typeof decisionSchema>,
    @CurrentUser() admin: User,
  ) {
    const request = await this.prisma.localityRequest.findUnique({ where: { id } });
    if (!request) throw new NotFound("Locality request");
    const city = await this.prisma.city.findUnique({ where: { id: request.cityId } });
    if (!city) throw new NotFound("City");

    let locality = null;
    if (dto.decision === "approved") {
      const name = dto.name ?? request.name;
      const slug = dto.slug ?? slugify(name);
      locality = await this.prisma.locality.upsert({
        where: { cityId_slug: { cityId: city.id, slug } },
        update: { name },
        create: {
          cityId: city.id,
          name,
          slug,
          aliases: [],
          centroidLat: dto.centroidLat ?? city.centroidLat,
          centroidLng: dto.centroidLng ?? city.centroidLng,
        },
      });
    }

    await this.prisma.localityRequest.update({
      where: { id },
      data: { resolved: true },
    });
    await this.reports.recordAction({
      id: randomUUID(),
      moderatorId: admin.id,
      targetType: "listing",
      targetId: locality?.id ?? request.id,
      action: locality ? "createlocality" : "updatelocality",
      note: `${dto.decision} locality request: ${dto.note}`,
      createdAt: new Date().toISOString(),
    });
    return { requestId: id, decision: dto.decision, locality };
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}
