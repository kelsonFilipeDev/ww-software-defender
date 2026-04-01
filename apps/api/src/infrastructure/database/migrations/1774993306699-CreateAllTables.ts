import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAllTables1774993306699 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.query(
      'CREATE TABLE IF NOT EXISTS "events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "entityId" character varying NOT NULL, "payload" jsonb, "correlationId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_events" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      "DO $$ BEGIN CREATE TYPE \"audit_logs_state_enum\" AS ENUM('NORMAL', 'SUSPEITO', 'ALERTA', 'CRITICO', 'BLOQUEADO'); EXCEPTION WHEN duplicate_object THEN null; END $$",
    );
    await queryRunner.query(
      "DO $$ BEGIN CREATE TYPE \"audit_logs_action_enum\" AS ENUM('ALLOW', 'THROTTLE', 'CHALLENGE', 'BLOCK'); EXCEPTION WHEN duplicate_object THEN null; END $$",
    );
    await queryRunner.query(
      "DO $$ BEGIN CREATE TYPE \"audit_logs_status_enum\" AS ENUM('EXECUTED', 'SKIPPED'); EXCEPTION WHEN duplicate_object THEN null; END $$",
    );
    await queryRunner.query(
      'CREATE TABLE IF NOT EXISTS "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entityId" character varying NOT NULL, "score" integer NOT NULL, "state" "audit_logs_state_enum" NOT NULL, "action" "audit_logs_action_enum" NOT NULL, "status" "audit_logs_status_enum" NOT NULL, "correlationId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id"))',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "audit_logs"');
    await queryRunner.query('DROP TABLE IF EXISTS "events"');
    await queryRunner.query('DROP TYPE IF EXISTS "audit_logs_status_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "audit_logs_action_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "audit_logs_state_enum"');
  }
}
