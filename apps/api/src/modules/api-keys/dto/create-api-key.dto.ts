import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateApiKeyDto {
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
