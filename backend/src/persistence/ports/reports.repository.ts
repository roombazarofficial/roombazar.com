import type {
  ModerationAction,
  Report,
  ReportTargetType,
} from "src/domain/report.entity";

export const REPORTS_REPOSITORY = Symbol("REPORTS_REPOSITORY");

export interface ReportsRepository {
  findById(id: string): Promise<Report | null>;
  listOpen(): Promise<Report[]>;
  countForTarget(
    targetType: ReportTargetType,
    targetId: string,
    reason?: string,
  ): Promise<number>;

  create(report: Report): Promise<Report>;
  update(id: string, patch: Partial<Report>): Promise<Report>;

  recordAction(action: ModerationAction): Promise<ModerationAction>;
  listActions(limit: number): Promise<ModerationAction[]>;
}
