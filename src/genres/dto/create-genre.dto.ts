import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * CreateGenreDto defines the data contract when creating a new genre.
 * class-validator decorators inspect incoming request bodies before they reach the service.
 */
export class CreateGenreDto {
  /**
   * @IsString() ensures the client sent a string (not a number, boolean, or array).
   * @IsNotEmpty() ensures the string is not blank/empty ("").
   * @MinLength(2) ensures the genre name has at least 2 characters.
   */
  @IsString({ message: 'Genre name must be a string' })
  @IsNotEmpty({ message: 'Genre name is required' })
  @MinLength(2, { message: 'Genre name must be at least 2 characters long' })
  name!: string;
}
