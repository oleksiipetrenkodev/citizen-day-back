import { IsEmail, IsInt, IsPositive } from 'class-validator';

export class CreateRegistrationDto {
  @IsEmail()
  email!: string;

  @IsInt()
  @IsPositive()
  eventId!: number;
}
