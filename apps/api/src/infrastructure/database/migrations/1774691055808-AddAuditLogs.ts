import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuditLogs1774691055808 implements MigrationInterface {
    name = 'AddAuditLogs1774691055808'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_state_enum" AS ENUM('NORMAL', 'SUSPEITO', 'ALERTA', 'CRITICO', 'BLOQUEADO')`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('ALLOW', 'THROTTLE', 'CHALLENGE', 'BLOCK')`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_status_enum" AS ENUM('EXECUTED', 'SKIPPED')`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entityId" character varying NOT NULL, "score" integer NOT NULL, "state" "public"."audit_logs_state_enum" NOT NULL, "action" "public"."audit_logs_action_enum" NOT NULL, "status" "public"."audit_logs_status_enum" NOT NULL, "correlationId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_state_enum"`);
    }

}
