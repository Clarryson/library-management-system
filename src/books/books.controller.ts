import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { BooksService } from './books.service.js';
import { CreateBookDto } from './dto/create-book.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  /**
   * POST /books
   * Restricted: Requires valid JWT and LIBRARIAN role.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LIBRARIAN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  /**
   * GET /books
   * PUBLIC: Anyone can browse the book catalog, filter by genre, search, and paginate.
   * Example: /books?genreId=1&search=Dune&page=1&limit=5
   */
  @Get()
  findAll(
    @Query('genreId') genreId?: number,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.booksService.findAll({ genreId, search, page, limit });
  }

  /**
   * GET /books/:id
   * PUBLIC: Anyone can view details for a specific book.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  /**
   * PATCH /books/:id
   * Restricted: Requires valid JWT and LIBRARIAN role.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LIBRARIAN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.booksService.update(id, updateBookDto);
  }

  /**
   * DELETE /books/:id
   * Restricted: Requires valid JWT and LIBRARIAN role.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LIBRARIAN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.remove(id);
  }
}
