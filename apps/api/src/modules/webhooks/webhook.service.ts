import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook } from './webhook.entity';
import { CreateWebhookDto } from './dto/create-webhook.dto';

export interface WebhookPayload {
  event: string;
  entityId: string;
  score: number;
  timestamp: Date;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectRepository(Webhook)
    private readonly webhookRepository: Repository<Webhook>,
  ) {}

  async register(dto: CreateWebhookDto): Promise<Webhook> {
    const webhook = this.webhookRepository.create(dto);
    return this.webhookRepository.save(webhook);
  }

  async findAll(): Promise<Webhook[]> {
    return this.webhookRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async deliver(payload: WebhookPayload): Promise<void> {
    const webhooks = await this.webhookRepository.find({
      where: { active: true },
    });

    for (const webhook of webhooks) {
      await this.deliverToWebhook(webhook, payload);
    }
  }

  private async deliverToWebhook(
    webhook: Webhook,
    payload: WebhookPayload,
    attempt = 1,
  ): Promise<void> {
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(webhook.secret ? { 'x-webhook-secret': webhook.secret } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      this.logger.log(
        `[WEBHOOK] Delivered to ${webhook.url} — event=${payload.event} entity=${payload.entityId}`,
      );
    } catch (error) {
      this.logger.warn(
        `[WEBHOOK] Attempt ${attempt} failed for ${webhook.url}: ${String(error)}`,
      );

      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
        await this.deliverToWebhook(webhook, payload, attempt + 1);
      } else {
        this.logger.error(
          `[WEBHOOK] All attempts failed for ${webhook.url} — entity=${payload.entityId}`,
        );
      }
    }
  }
}
