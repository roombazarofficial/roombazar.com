import { applyDecorators, UseGuards } from "@nestjs/common";
import { Roles } from "./roles.decorator";
import { RolesGuard } from "src/common/guards/roles.guard";

export const SuperAdminOnly = () =>
  applyDecorators(UseGuards(RolesGuard), Roles("superadmin"));

export const AdminOrAbove = () =>
  applyDecorators(UseGuards(RolesGuard), Roles("admin", "superadmin"));

export const ModeratorOrAbove = () =>
  applyDecorators(
    UseGuards(RolesGuard),
    Roles("moderator", "admin", "superadmin"),
  );
