import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveToTenantDefaultSchema1776000000001
  implements MigrationInterface
{
  name = 'MoveToTenantDefaultSchema1776000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Criar schema tenant_default
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS tenant_default`);

    // 2. Mover ENUMs para tenant_default (recriar no novo schema)
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "tenant_default"."audit_logs_state_enum"
        AS ENUM('NORMAL', 'SUSPEITO', 'ALERTA', 'CRITICO', 'BLOQUEADO');
      EXCEPTION WHEN duplicate_object THEN null; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "tenant_default"."audit_logs_action_enum"
        AS ENUM('ALLOW', 'THROTTLE', 'CHALLENGE', 'BLOCK');
      EXCEPTION WHEN duplicate_object THEN null; END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "tenant_default"."audit_logs_status_enum"
        AS ENUM('EXECUTED', 'SKIPPED');
      EXCEPTION WHEN duplicate_object THEN null; END $$
    `);

    // 3. Mover tabelas operacionais para tenant_default
    await queryRunner.query(
      `ALTER TABLE public.events SET SCHEMA tenant_default`,
    );
    await queryRunner.query(
      `ALTER TABLE public.audit_logs SET SCHEMA tenant_default`,
    );
    await queryRunner.query(
      `ALTER TABLE public.api_keys SET SCHEMA tenant_default`,
    );
    await queryRunner.query(
      `ALTER TABLE public.webhooks SET SCHEMA tenant_default`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE tenant_default.webhooks SET SCHEMA public`,
    );
    await queryRunner.query(
      `ALTER TABLE tenant_default.api_keys SET SCHEMA public`,
    );
    await queryRunner.query(
      `ALTER TABLE tenant_default.audit_logs SET SCHEMA public`,
    );
    await queryRunner.query(
      `ALTER TABLE tenant_default.events SET SCHEMA public`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "tenant_default"."audit_logs_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "tenant_default"."audit_logs_action_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "tenant_default"."audit_logs_state_enum"`,
    );
    await queryRunner.query(`DROP SCHEMA IF EXISTS tenant_default`);
  }
}
