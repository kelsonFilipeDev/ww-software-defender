import { Controller, Get, Param } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async findAll() {
    return this.auditService.findAll();
  }

  @Get(':entityId')
  async findByEntityId(@Param('entityId') entityId: string) {
    return this.auditService.findByEntityId(entityId);
  }
}
