import { IsString, IsNotEmpty, IsUrl, IsOptional } from 'class-validator';

export class CreateWebhookDto {
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsOptional()
  secret?: string;
}
