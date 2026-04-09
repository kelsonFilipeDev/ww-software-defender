import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CombinedAuthGuard } from '../../shared/guards/combined-auth.guard';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @UseGuards(CombinedAuthGuard)
  @Post()
  async create(@Body() dto: CreateEventDto) {
    return this.eventService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.eventService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':entityId')
  async findByEntityId(@Param('entityId') entityId: string) {
    return this.eventService.findByEntityId(entityId);
  }
}
