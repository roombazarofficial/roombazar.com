import type { TrustLevel, User } from "src/domain/user.entity";

export const USERS_REPOSITORY = Symbol("USERS_REPOSITORY");

export interface UsersRepository {
  findById(id: string): Promise<User | null>;
  /** The lookup every authenticated request performs. */
  findByEmail(email: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;

  findManyByIds(ids: string[]): Promise<Map<string, User>>;

  create(user: User): Promise<User>;
  update(id: string, patch: Partial<User>): Promise<User>;
  setTrustLevel(id: string, level: TrustLevel): Promise<User>;

  softDelete(id: string): Promise<void>;
}
