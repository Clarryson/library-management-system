import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateGenreDto } from './dto/create-genre.dto.js';
import { UpdateGenreDto } from './dto/update-genre.dto.js';

@Injectable()
export class GenresService {
  // Inject PrismaService to interact with the database
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new Genre.
   * Checks for duplicate name to throw a friendly ConflictException.
   */
  async create(createGenreDto: CreateGenreDto) {
    const existing = await this.prisma.genre.findUnique({
      where: { name: createGenreDto.name },
    });

    if (existing) {
      throw new ConflictException(
        `Genre "${createGenreDto.name}" already exists`,
      );
    }

    return this.prisma.genre.create({
      data: createGenreDto,
    });
  }

  /**
   * Find all genres in the catalog.
   */
  async findAll() {
    return this.prisma.genre.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Find a single genre by ID.
   * Throws NotFoundException if the genre does not exist.
   */
  async findOne(id: number) {
    const genre = await this.prisma.genre.findUnique({
      where: { id },
      include: {
        books: true, // Includes list of books belonging to this genre
      },
    });

    if (!genre) {
      throw new NotFoundException(`Genre with ID ${id} not found`);
    }

    return genre;
  }

  /**
   * Update an existing genre by ID.
   */
  async update(id: number, updateGenreDto: UpdateGenreDto) {
    // Verify genre exists first
    await this.findOne(id);

    return this.prisma.genre.update({
      where: { id },
      data: updateGenreDto,
    });
  }

  /**
   * Delete a genre by ID.
   */
  async remove(id: number) {
    // Verify genre exists first
    await this.findOne(id);

    return this.prisma.genre.delete({
      where: { id },
    });
  }
}
