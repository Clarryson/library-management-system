import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * RegisterDto defines the data contract for user registration.
 * Notice: We deliberately do NOT accept a 'role' parameter here.
 * This prevents malicious users from granting themselves the LIBRARIAN role!
 */
export class RegisterDto {
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;
}
