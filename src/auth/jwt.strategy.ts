import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service.js';

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
}

/**
 * JwtStrategy automatically extracts and verifies the Bearer JWT token from the Authorization header.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET || 'super-secret-jwt-key-for-library-mgmt-2026',
    });
  }

  /**
   * Called automatically after Passport verifies the token signature and expiration.
   * Whatever this method returns is attached to req.user.
   */
  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    // Never attach password hash to the request user object
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
