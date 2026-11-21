import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user.
   * - Checks for duplicate email.
   * - Hashes the password using bcrypt.
   * - Enforces PATRON role (public users cannot register as LIBRARIAN).
   * - Never returns password hash in the response.
   */
  async register(registerDto: RegisterDto) {
    // 1. Check if email is already registered
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    // 2. Hash password with 10 salt rounds
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // 3. Save new user (defaulting role strictly to PATRON)
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        password: hashedPassword,
        role: Role.PATRON,
      },
    });

    // 4. Return user profile without password hash
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  /**
   * Login with email and password.
   * - Validates credentials.
   * - Generates and returns signed JWT token.
   */
  async login(loginDto: LoginDto) {
    // 1. Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2. Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Build JWT payload and sign token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    // 4. Return token and user profile
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
