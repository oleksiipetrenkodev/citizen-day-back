import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCmsId1786975376427 implements MigrationInterface {
  name = 'RemoveCmsId1786975376427';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT "UQ_98ea70af6c105f0ba7b013e4e13"`,
    );
    await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "cmsId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "events" ADD "cmsId" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "UQ_98ea70af6c105f0ba7b013e4e13" UNIQUE ("cmsId")`,
    );
  }
}
