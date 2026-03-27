import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1774646631477 implements MigrationInterface {
  public up(_queryRunner: QueryRunner): Promise<void> {
    return Promise.resolve();
  }

  public down(_queryRunner: QueryRunner): Promise<void> {
    return Promise.resolve();
  }
}
