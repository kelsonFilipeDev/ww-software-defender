import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async create(@Body() dto: CreateEventDto) {
    return this.eventService.create(dto);
  }

  @Get()
  async findAll() {
    return this.eventService.findAll();
  }

  @Get(':entityId')
  async findByEntityId(@Param('entityId') entityId: string) {
    return this.eventService.findByEntityId(entityId);
  }
}
