import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropEventConfirmedCount1787000000001 implements MigrationInterface {
  name = 'DropEventConfirmedCount1787000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Capacity is now derived from a live COUNT of confirmed registrations,
    // so the denormalized counter is no longer maintained.
    await queryRunner.query(
      `ALTER TABLE "events" DROP COLUMN "confirmedCount"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "events" ADD COLUMN "confirmedCount" integer NOT NULL DEFAULT 0`,
    );
  }
}
