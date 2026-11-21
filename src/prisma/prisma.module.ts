import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

/**
 * @Global() makes PrismaService available everywhere across the application
 * without having to manually import PrismaModule into every single feature module.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
