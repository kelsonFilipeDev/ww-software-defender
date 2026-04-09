import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EventEntity } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async create(dto: CreateEventDto): Promise<EventEntity> {
    const maxEvents = parseInt(process.env.MAX_EVENTS_PER_MINUTE ?? '30', 10);
    const key = `rate:${dto.entityId}`;

    const current = await this.cacheManager.get<number>(key);

    if (current === undefined || current === null) {
      await this.cacheManager.set(key, 1, 60000);
    } else if (current >= maxEvents) {
      throw new HttpException(
        `Rate limit exceeded for entity ${dto.entityId}`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    } else {
      await this.cacheManager.set(key, current + 1, 60000);
    }

    const event = this.eventRepository.create(dto);
    return this.eventRepository.save(event);
  }

  async findAll(): Promise<EventEntity[]> {
    return this.eventRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByEntityId(entityId: string): Promise<EventEntity[]> {
    return this.eventRepository.find({
      where: { entityId },
      order: { createdAt: 'DESC' },
    });
  }
}
