import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  entityId: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  correlationId?: string;
}
