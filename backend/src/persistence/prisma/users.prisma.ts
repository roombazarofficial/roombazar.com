import { Injectable } from "@nestjs/common";
import type { TrustLevel, User } from "src/domain/user.entity";
import type { UsersRepository } from "src/persistence/ports/users.repository";
import type { UserAdminCriteria, UserPage } from "src/persistence/ports/users.repository";
import { PrismaService } from "./prisma.service";
import { toDomainUser, userInclude } from "./mappers";

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { id },
      include: userInclude,
    });

    return row ? toDomainUser(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { email },
      include: userInclude,
    });

    return row ? toDomainUser(row) : null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { phone },
      include: userInclude,
    });

    return row ? toDomainUser(row) : null;
  }

  async findManyByIds(ids: string[]): Promise<Map<string, User>> {
    if (ids.length === 0) return new Map();

    const rows = await this.prisma.user.findMany({
      where: { id: { in: [...new Set(ids)] } },
      include: userInclude,
    });

    return new Map(rows.map((row) => [row.id, toDomainUser(row)]));
  }

  async findForAdmin(criteria: UserAdminCriteria): Promise<UserPage> {
    const where = {
      ...(criteria.role && { platformRole: criteria.role }),
      ...(criteria.trustLevel && { trustLevel: criteria.trustLevel }),
      ...(criteria.query && {
        OR: [
          { name: { contains: criteria.query, mode: "insensitive" as const } },
          { email: { contains: criteria.query, mode: "insensitive" as const } },
          { phone: { contains: criteria.query, mode: "insensitive" as const } },
        ],
      }),
    };

    const [totalItems, rows] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        include: userInclude,
        orderBy: { createdAt: "desc" },
        skip: (criteria.page - 1) * criteria.pageSize,
        take: criteria.pageSize,
      }),
    ]);

    return {
      items: rows.map(toDomainUser),
      page: criteria.page,
      pageSize: criteria.pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / criteria.pageSize)),
    };
  }

  async countByRole(role: User["role"]): Promise<number> {
    return this.prisma.user.count({ where: { platformRole: role } });
  }

  async create(user: User): Promise<User> {
    const row = await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        emailVerifiedAt: user.emailVerifiedAt
          ? new Date(user.emailVerifiedAt)
          : null,
        passwordHash: user.passwordHash,
        phone: user.phone,
        phoneVerifiedAt: user.phoneVerifiedAt
          ? new Date(user.phoneVerifiedAt)
          : null,
        name: user.name,
        avatarUrl: user.avatarUrl,
        platformRole: user.role,
        trustLevel: user.trustLevel,
        verifications: user.verifications.includes("email")
          ? { create: [{ kind: "email", status: "approved", decidedAt: new Date() }] }
          : undefined,
      },
      include: userInclude,
    });

    return toDomainUser(row);
  }

  async update(id: string, patch: Partial<User>): Promise<User> {
    const row = await this.prisma.user.update({
      where: { id },
      data: {
        ...(patch.name !== undefined && { name: patch.name }),
        ...(patch.email !== undefined && { email: patch.email }),
        ...(patch.passwordHash !== undefined && {
          passwordHash: patch.passwordHash,
        }),
        ...(patch.phone !== undefined && { phone: patch.phone }),
        ...(patch.avatarUrl !== undefined && { avatarUrl: patch.avatarUrl }),
        ...(patch.role !== undefined && { platformRole: patch.role }),
        ...(patch.trustLevel !== undefined && { trustLevel: patch.trustLevel }),
        ...(patch.phoneVerifiedAt !== undefined && {
          phoneVerifiedAt: patch.phoneVerifiedAt ? new Date(patch.phoneVerifiedAt) : null,
        }),
      },
      include: userInclude,
    });

    return toDomainUser(row);
  }

  async setTrustLevel(id: string, level: TrustLevel): Promise<User> {
    const row = await this.prisma.user.update({
      where: { id },
      data: { trustLevel: level },
      include: userInclude,
    });

    return toDomainUser(row);
  }

  async softDelete(id: string): Promise<void> {
    const existing = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) return;

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          name: "Deleted account",
          avatarUrl: null,
          phone: null,
          phoneVerifiedAt: null,
          /*
            Uniqueness still applies, so the address cannot simply be emptied
            for a second deleted account. A tombstone keeps the column unique
            while carrying nothing personal, and the password is replaced with
            a value no input can hash to.
          */
          email: `deleted+${id}@roombazar.invalid`,
          passwordHash: "deleted",
        },
      });

      await tx.listing.updateMany({
        where: { createdById: id, status: { in: ["active", "paused"] } },
        data: { status: "expired", deletedAt: new Date() },
      });
    });
  }
}
