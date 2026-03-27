import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEntity } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>,
  ) {}

  async create(dto: CreateEventDto): Promise<EventEntity> {
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
