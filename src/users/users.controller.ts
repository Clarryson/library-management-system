import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('users')
export class UsersController {
  /**
   * GET /users/profile
   * Protected endpoint: Uses @Req() to access the authenticated user
   * populated by JwtAuthGuard from the validated JWT token.
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    return req.user;
  }
}
