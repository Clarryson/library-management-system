import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';

/**
 * UpdateBookDto defines the validation rules when updating an existing book.
 * All fields are optional so clients can send partial updates.
 */
export class UpdateBookDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Author must be a string' })
  author?: string;

  @IsOptional()
  @IsString({ message: 'ISBN must be a string' })
  isbn?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Total copies must be an integer' })
  @Min(1, { message: 'Total copies must be at least 1' })
  totalCopies?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Genre ID must be an integer' })
  @IsPositive({ message: 'Genre ID must be a positive number' })
  genreId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Published year must be an integer' })
  publishedYear?: number;
}
