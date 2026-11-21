import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator.js';

/**
 * RolesGuard inspects the authenticated user's role against the @Roles() metadata.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Retrieve the required roles attached via the @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required on this route, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 2. Get the authenticated user from the HTTP request (populated by JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: No role assigned to user');
    }

    // 3. Check if user's role matches any required role
    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied: Requires role ${requiredRoles.join(' or ')}. Your role is ${user.role}`,
      );
    }

    return true;
  }
}
