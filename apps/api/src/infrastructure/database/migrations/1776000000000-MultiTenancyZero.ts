import { MigrationInterface, QueryRunner } from 'typeorm';

export class MultiTenancyZero1776000000000 implements MigrationInterface {
  name = 'MultiTenancyZero1776000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Criar tabela tenants no schema public
    await queryRunner.query(`
      CREATE TABLE "public"."tenants" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "schema_name" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'active',
        CONSTRAINT "UQ_tenants_slug" UNIQUE ("slug"),
        CONSTRAINT "UQ_tenants_schema_name" UNIQUE ("schema_name"),
        CONSTRAINT "PK_tenants" PRIMARY KEY ("id")
      )
    `);

    // 2. Inserir tenant_default
    await queryRunner.query(`
      INSERT INTO "public"."tenants" ("name", "slug", "schema_name", "status")
      VALUES ('Default Tenant', 'default', 'tenant_default', 'active')
    `);

    // 3. Adicionar tenantId em api_keys (nullable primeiro para backfill)
    await queryRunner.query(`
      ALTER TABLE "api_keys"
      ADD COLUMN "tenantId" uuid
    `);

    // 4. Backfill — todas as keys existentes vão para tenant_default
    await queryRunner.query(`
      UPDATE "api_keys"
      SET "tenantId" = (SELECT "id" FROM "public"."tenants" WHERE "slug" = 'default')
    `);

    // 5. Tornar NOT NULL e adicionar FK
    await queryRunner.query(`
      ALTER TABLE "api_keys"
      ALTER COLUMN "tenantId" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "api_keys"
      ADD CONSTRAINT "FK_api_keys_tenant"
      FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id")
      ON DELETE CASCADE
    `);

    // 6. Remover clientId
    await queryRunner.query(`
      ALTER TABLE "api_keys"
      DROP COLUMN "clientId"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "api_keys" DROP CONSTRAINT "FK_api_keys_tenant"`);
    await queryRunner.query(`ALTER TABLE "api_keys" DROP COLUMN "tenantId"`);
    await queryRunner.query(`ALTER TABLE "api_keys" ADD COLUMN "clientId" character varying NOT NULL DEFAULT 'default'`);
    await queryRunner.query(`DROP TABLE "public"."tenants"`);
  }
}
