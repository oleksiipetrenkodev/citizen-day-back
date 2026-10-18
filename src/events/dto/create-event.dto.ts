import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  cmsId!: string;

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
