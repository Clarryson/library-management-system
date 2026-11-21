import 'dotenv/config';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService manages the connection to our PostgreSQL database.
 *
 * 1. Why 'extends PrismaClient'?
 *    By extending PrismaClient, PrismaService inherits all database querying methods
 *    (e.g., this.book.findMany(), this.user.create()).
 *
 * 2. Why '@Injectable()'?
 *    This tells NestJS's Dependency Injection system that this class can be
 *    injected into other services or controllers (like BooksService or UsersService).
 *
 * 3. Why 'implements OnModuleInit'?
 *    OnModuleInit is a NestJS lifecycle hook interface. It requires us to implement
 *    the 'onModuleInit()' method, which runs automatically when the application starts up.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  /**
   * onModuleInit() is called by NestJS as soon as the module is initialized.
   * We establish the database connection here before handling any incoming requests.
   */
  async onModuleInit() {
    // Connect to PostgreSQL database using DATABASE_URL from .env
    await this.$connect();
  }
}
