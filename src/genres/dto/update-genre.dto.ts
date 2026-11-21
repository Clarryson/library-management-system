import { IsOptional, IsString, MinLength } from 'class-validator';

/**
 * UpdateGenreDto defines the data contract when updating an existing genre.
 * All fields are optional because the client might only update one property.
 */
export class UpdateGenreDto {
  @IsOptional()
  @IsString({ message: 'Genre name must be a string' })
  @MinLength(2, { message: 'Genre name must be at least 2 characters long' })
  name?: string;
}
