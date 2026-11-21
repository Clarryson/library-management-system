import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

/**
 * CreateBookDto defines the validation rules when creating a new book.
 * Every decorator protects against malformed or malicious data.
 */
export class CreateBookDto {
  /**
   * Title of the book (required text).
   */
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title!: string;

  /**
   * Author of the book (required text).
   */
  @IsString({ message: 'Author must be a string' })
  @IsNotEmpty({ message: 'Author is required' })
  author!: string;

  /**
   * International Standard Book Number (unique string).
   */
  @IsString({ message: 'ISBN must be a string' })
  @IsNotEmpty({ message: 'ISBN is required' })
  isbn!: string;

  /**
   * Total copies in the library catalog.
   * @Type(() => Number) ensures JSON string numbers (e.g. "5") are converted to numbers.
   * @IsInt() ensures it is an integer.
   * @Min(1) ensures the library has at least 1 copy.
   */
  @Type(() => Number)
  @IsInt({ message: 'Total copies must be an integer' })
  @Min(1, { message: 'Total copies must be at least 1' })
  totalCopies!: number;

  /**
   * Foreign Key linking the book to an existing Genre.
   * @IsPositive() ensures the ID is greater than 0.
   */
  @Type(() => Number)
  @IsInt({ message: 'Genre ID must be an integer' })
  @IsPositive({ message: 'Genre ID must be a positive number' })
  genreId!: number;

  /**
   * Optional publication year.
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Published year must be an integer' })
  publishedYear?: number;
}
