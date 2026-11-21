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
} from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto.js';
import { UpdateGenreDto } from './dto/update-genre.dto.js';
import { GenresService } from './genres.service.js';

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  /**
   * POST /genres
   * Creates a new genre.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createGenreDto: CreateGenreDto) {
    return this.genresService.create(createGenreDto);
  }

  /**
   * GET /genres
   * Returns all genres.
   */
  @Get()
  findAll() {
    return this.genresService.findAll();
  }

  /**
   * GET /genres/:id
   * Returns a specific genre by its ID.
   * ParseIntPipe converts string ":id" to a number automatically.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.genresService.findOne(id);
  }

  /**
   * PATCH /genres/:id
   * Updates an existing genre by ID.
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGenreDto: UpdateGenreDto,
  ) {
    return this.genresService.update(id, updateGenreDto);
  }

  /**
   * DELETE /genres/:id
   * Removes a genre by ID.
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.genresService.remove(id);
  }
}
