import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEventCmsId1787000000002 implements MigrationInterface {
  name = 'AddEventCmsId1787000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add nullable first so any existing rows survive, backfill a placeholder,
    // then enforce NOT NULL + UNIQUE.
    await queryRunner.query(
      `ALTER TABLE "events" ADD COLUMN "cmsId" character varying`,
    );
    await queryRunner.query(
      `UPDATE "events" SET "cmsId" = 'legacy-' || "id" WHERE "cmsId" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ALTER COLUMN "cmsId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "UQ_events_cmsId" UNIQUE ("cmsId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT "UQ_events_cmsId"`,
    );
    await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "cmsId"`);
  }
}
