import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreatedAtToTenants1776000000002 implements MigrationInterface {
  name = 'AddCreatedAtToTenants1776000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.tenants
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT now()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.tenants
      DROP COLUMN IF EXISTS created_at
    `);
  }
}
