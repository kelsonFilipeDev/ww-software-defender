import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WebhookService } from './webhook.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';

@UseGuards(JwtAuthGuard)
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  async register(@Body() dto: CreateWebhookDto) {
    return this.webhookService.register(dto);
  }

  @Get()
  async findAll() {
    return this.webhookService.findAll();
  }
}
