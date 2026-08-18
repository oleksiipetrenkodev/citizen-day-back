import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateEventDto {
  @IsInt()
  @IsPositive()
  capacity!: number;

  @IsDateString()
  registrationStartsAt!: string;

  @IsDateString()
  registrationEndsAt!: string;

  @IsString()
  @IsNotEmpty()
  status!: string;
}
