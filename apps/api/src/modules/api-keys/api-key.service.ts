import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes, createHash } from 'crypto';
import { ApiKey } from './api-key.entity';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
  ) {}

  async create(
    dto: CreateApiKeyDto,
  ): Promise<{ id: string; key: string; clientId: string }> {
    const rawKey = randomBytes(32).toString('hex');
    const hashed = createHash('sha256').update(rawKey).digest('hex');

    const apiKey = this.apiKeyRepository.create({
      key: hashed,
      clientId: dto.clientId,
      active: true,
    });

    await this.apiKeyRepository.save(apiKey);

    return { id: apiKey.id, key: rawKey, clientId: apiKey.clientId };
  }

  async validate(rawKey: string): Promise<ApiKey | null> {
    const hashed = createHash('sha256').update(rawKey).digest('hex');
    const apiKey = await this.apiKeyRepository.findOne({
      where: { key: hashed, active: true },
    });
    return apiKey ?? null;
  }

  async revoke(id: string): Promise<void> {
    const apiKey = await this.apiKeyRepository.findOne({ where: { id } });
    if (!apiKey) throw new NotFoundException('API Key not found');
    apiKey.active = false;
    await this.apiKeyRepository.save(apiKey);
  }
}
