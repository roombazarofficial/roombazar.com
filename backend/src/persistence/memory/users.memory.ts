import { Injectable } from "@nestjs/common";
import { NotFound } from "src/common/errors/domain.errors";
import type { TrustLevel, User } from "src/domain/user.entity";
import type { UsersRepository } from "src/persistence/ports/users.repository";
import type { UserAdminCriteria, UserPage } from "src/persistence/ports/users.repository";

@Injectable()
export class MemoryUsersRepository implements UsersRepository {
  private readonly rows = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.rows.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.rows.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    for (const user of this.rows.values()) {
      if (user.phone === phone) return user;
    }
    return null;
  }

  async findManyByIds(ids: string[]): Promise<Map<string, User>> {
    const found = new Map<string, User>();

    for (const id of new Set(ids)) {
      const user = this.rows.get(id);
      if (user) found.set(id, user);
    }

    return found;
  }

  async findForAdmin(criteria: UserAdminCriteria): Promise<UserPage> {
    let users = [...this.rows.values()];
    if (criteria.role) users = users.filter((user) => user.role === criteria.role);
    if (criteria.trustLevel) {
      users = users.filter((user) => user.trustLevel === criteria.trustLevel);
    }
    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      users = users.filter((user) =>
        `${user.name} ${user.email} ${user.phone ?? ""}`
          .toLowerCase()
          .includes(query),
      );
    }
    users.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = (criteria.page - 1) * criteria.pageSize;
    return {
      items: users.slice(start, start + criteria.pageSize),
      page: criteria.page,
      pageSize: criteria.pageSize,
      totalItems: users.length,
      totalPages: Math.max(1, Math.ceil(users.length / criteria.pageSize)),
    };
  }

  async countByRole(role: User["role"]): Promise<number> {
    return [...this.rows.values()].filter((user) => user.role === role).length;
  }

  async create(user: User): Promise<User> {
    this.rows.set(user.id, user);
    return user;
  }

  async update(id: string, patch: Partial<User>): Promise<User> {
    const existing = this.rows.get(id);
    if (!existing) throw new NotFound("User");

    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    this.rows.set(id, updated);
    return updated;
  }

  async setTrustLevel(id: string, level: TrustLevel): Promise<User> {
    return this.update(id, { trustLevel: level });
  }

  async softDelete(id: string): Promise<void> {
    const existing = this.rows.get(id);
    if (!existing) return;

    this.rows.set(id, {
      ...existing,
      deletedAt: new Date().toISOString(),
      phone: null,
      email: `deleted+${id}@roombazar.invalid`,
      name: "Deleted account",
      avatarUrl: null,
    });
  }

  seed(users: User[]): void {
    for (const user of users) this.rows.set(user.id, user);
  }
}
