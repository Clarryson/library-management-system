import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBookDto } from './dto/create-book.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new Book.
   * Validates that the Genre exists and that the ISBN is not already used.
   */
  async create(createBookDto: CreateBookDto) {
    // 1. Verify referenced genre exists
    const genre = await this.prisma.genre.findUnique({
      where: { id: createBookDto.genreId },
    });
    if (!genre) {
      throw new NotFoundException(
        `Genre with ID ${createBookDto.genreId} does not exist`,
      );
    }

    // 2. Check for duplicate ISBN
    const existingIsbn = await this.prisma.book.findUnique({
      where: { isbn: createBookDto.isbn },
    });
    if (existingIsbn) {
      throw new ConflictException(
        `Book with ISBN "${createBookDto.isbn}" already exists`,
      );
    }

    // 3. Create the book
    return this.prisma.book.create({
      data: createBookDto,
      include: {
        genre: true,
      },
    });
  }

  /**
   * Find books with optional genre filtering, title/author search, and pagination.
   */
  async findAll(params: {
    genreId?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { genreId, search, page = 1, limit = 10 } = params;

    // Ensure page and limit are positive integers
    const pageNumber = Math.max(1, Number(page) || 1);
    const take = Math.max(1, Number(limit) || 10);
    const skip = (pageNumber - 1) * take;

    // Build Prisma dynamic where clause
    const where: Prisma.BookWhereInput = {};

    // Filter by genreId if supplied
    if (genreId) {
      where.genreId = Number(genreId);
    }

    // Search by title OR author if search query is supplied
    if (search && search.trim() !== '') {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { author: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    // Run count and query in parallel using a Prisma transaction
    const [total, books] = await this.prisma.$transaction([
      this.prisma.book.count({ where }),
      this.prisma.book.findMany({
        where,
        skip,
        take,
        include: {
          genre: true,
        },
        orderBy: { title: 'asc' },
      }),
    ]);

    return {
      data: books,
      meta: {
        total,
        page: pageNumber,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * Find a single book by ID.
   */
  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        genre: true,
        reviews: true,
      },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  /**
   * Update a book by ID.
   */
  async update(id: number, updateBookDto: UpdateBookDto) {
    // 1. Verify book exists
    await this.findOne(id);

    // 2. If changing genre, verify new genre exists
    if (updateBookDto.genreId) {
      const genre = await this.prisma.genre.findUnique({
        where: { id: updateBookDto.genreId },
      });
      if (!genre) {
        throw new NotFoundException(
          `Genre with ID ${updateBookDto.genreId} does not exist`,
        );
      }
    }

    // 3. If changing ISBN, check for collision
    if (updateBookDto.isbn) {
      const existing = await this.prisma.book.findUnique({
        where: { isbn: updateBookDto.isbn },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `ISBN "${updateBookDto.isbn}" is already in use by another book`,
        );
      }
    }

    return this.prisma.book.update({
      where: { id },
      data: updateBookDto,
      include: {
        genre: true,
      },
    });
  }

  /**
   * Remove a book by ID.
   */
  async remove(id: number) {
    // 1. Verify book exists
    await this.findOne(id);

    // 2. Delete dependent reviews first (referential integrity)
    await this.prisma.review.deleteMany({
      where: { bookId: id },
    });

    // 3. Delete the book
    return this.prisma.book.delete({
      where: { id },
    });
  }
}
