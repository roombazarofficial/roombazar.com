import { Injectable } from "@nestjs/common";
import type {
  ModerationAction,
  Report,
  ReportTargetType,
} from "src/domain/report.entity";
import type { ReportsRepository } from "src/persistence/ports/reports.repository";
import { PrismaService } from "./prisma.service";
import { toDomainModerationAction, toDomainReport } from "./mappers";

@Injectable()
export class PrismaReportsRepository implements ReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Report | null> {
    const row = await this.prisma.report.findUnique({ where: { id } });
    return row ? toDomainReport(row) : null;
  }

  async listOpen(): Promise<Report[]> {
    const rows = await this.prisma.report.findMany({
      where: { status: "open" },
      orderBy: { createdAt: "asc" },
    });

    return rows.map(toDomainReport);
  }

  async countForTarget(
    targetType: ReportTargetType,
    targetId: string,
    reason?: string,
  ): Promise<number> {
    return this.prisma.report.count({
      where: {
        targetType,
        targetId,
        ...(reason && { reason: reason as Report["reason"] }),
      },
    });
  }

  async create(report: Report): Promise<Report> {
    const row = await this.prisma.report.create({
      data: {
        id: report.id,
        reporterId: report.reporterId,
        targetType: report.targetType,
        targetId: report.targetId,
        reason: report.reason,
        detail: report.detail,
        status: report.status,
      },
    });

    return toDomainReport(row);
  }

  async update(id: string, patch: Partial<Report>): Promise<Report> {
    const row = await this.prisma.report.update({
      where: { id },
      data: {
        ...(patch.status !== undefined && { status: patch.status }),
        ...(patch.detail !== undefined && { detail: patch.detail }),
        ...(patch.resolvedAt !== undefined && {
          resolvedAt: patch.resolvedAt ? new Date(patch.resolvedAt) : null,
        }),
      },
    });

    return toDomainReport(row);
  }

  async recordAction(action: ModerationAction): Promise<ModerationAction> {
    const row = await this.prisma.moderationAction.create({
      data: {
        id: action.id,
        moderatorId: action.moderatorId,
        targetType: action.targetType,
        targetId: action.targetId,
        action: action.action,
        note: action.note,
      },
    });

    return toDomainModerationAction(row);
  }

  async listActions(limit: number): Promise<ModerationAction[]> {
    const rows = await this.prisma.moderationAction.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return rows.map(toDomainModerationAction);
  }
}
