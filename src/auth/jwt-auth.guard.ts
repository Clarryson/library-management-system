import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard protects routes by requiring a valid Bearer JWT token in the Authorization header.
 * Automatically throws 401 Unauthorized if the token is missing, expired, or invalid.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
