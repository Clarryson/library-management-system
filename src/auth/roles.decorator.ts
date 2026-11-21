import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * @Roles(Role.LIBRARIAN) decorator.
 * Attaches metadata to route handlers specifying which roles are allowed to call it.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
