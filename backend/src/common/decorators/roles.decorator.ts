import { SetMetadata } from "@nestjs/common";
import type { UserRole } from "src/domain/user.entity";

export const REQUIRED_ROLES = "requiredroles";

export const Roles = (...roles: UserRole[]) =>
  SetMetadata(REQUIRED_ROLES, roles);
