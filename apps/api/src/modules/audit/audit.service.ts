import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditEntity } from './audit.entity';
import { CreateAuditDto } from './dto/create-audit.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditEntity)
    private readonly auditRepository: Repository<AuditEntity>,
  ) {}

  async log(dto: CreateAuditDto): Promise<AuditEntity> {
    const entry = this.auditRepository.create(dto);
    return this.auditRepository.save(entry);
  }

  async findAll(): Promise<AuditEntity[]> {
    return this.auditRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByEntityId(entityId: string): Promise<AuditEntity[]> {
    return this.auditRepository.find({
      where: { entityId },
      order: { createdAt: 'DESC' },
    });
  }
}
