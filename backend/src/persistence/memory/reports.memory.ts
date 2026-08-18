import { Injectable } from "@nestjs/common";
import { NotFound } from "src/common/errors/domain.errors";
import type {
  ModerationAction,
  Report,
  ReportTargetType,
} from "src/domain/report.entity";
import type { ReportsRepository } from "src/persistence/ports/reports.repository";

@Injectable()
export class MemoryReportsRepository implements ReportsRepository {
  private readonly reports = new Map<string, Report>();
  private readonly actions: ModerationAction[] = [];

  async findById(id: string): Promise<Report | null> {
    return this.reports.get(id) ?? null;
  }

  async listOpen(): Promise<Report[]> {
    return [...this.reports.values()]
      .filter((report) => report.status === "open")
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  }

  async countForTarget(
    targetType: ReportTargetType,
    targetId: string,
    reason?: string,
  ): Promise<number> {
    return [...this.reports.values()].filter(
      (report) =>
        report.targetType === targetType &&
        report.targetId === targetId &&
        (reason === undefined || report.reason === reason),
    ).length;
  }

  async create(report: Report): Promise<Report> {
    this.reports.set(report.id, report);
    return report;
  }

  async update(id: string, patch: Partial<Report>): Promise<Report> {
    const existing = this.reports.get(id);
    if (!existing) throw new NotFound("Report");

    const updated = { ...existing, ...patch };
    this.reports.set(id, updated);
    return updated;
  }

  async recordAction(action: ModerationAction): Promise<ModerationAction> {
    this.actions.push(action);
    return action;
  }

  async listActions(limit: number): Promise<ModerationAction[]> {
    return [...this.actions]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, limit);
  }
}
