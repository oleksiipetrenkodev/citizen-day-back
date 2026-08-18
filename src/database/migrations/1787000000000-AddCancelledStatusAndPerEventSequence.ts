import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCancelledStatusAndPerEventSequence1787000000000 implements MigrationInterface {
  name = 'AddCancelledStatusAndPerEventSequence1787000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // New soft-cancel status.
    await queryRunner.query(
      `ALTER TYPE "public"."registrations_status_enum" ADD VALUE IF NOT EXISTS 'cancelled'`,
    );

    // Convert sequenceNumber from a global BIGSERIAL into a plain bigint that
    // we allocate per-event (MAX+1) under the event row lock.
    await queryRunner.query(
      `ALTER TABLE "registrations" DROP CONSTRAINT "UQ_14774cf5b1cc9b11a610f48cda5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "registrations" ALTER COLUMN "sequenceNumber" DROP DEFAULT`,
    );
    await queryRunner.query(
      `DROP SEQUENCE IF EXISTS "registrations_sequenceNumber_seq"`,
    );
    await queryRunner.query(
      `ALTER TABLE "registrations" ADD CONSTRAINT "UQ_registrations_event_sequence" UNIQUE ("eventId", "sequenceNumber")`,
    );

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
    await queryRunner.query(
      `ALTER TABLE "registrations" DROP CONSTRAINT "UQ_registrations_event_sequence"`,
    );
    await queryRunner.query(
      `CREATE SEQUENCE "registrations_sequenceNumber_seq" OWNED BY "registrations"."sequenceNumber"`,
    );
    await queryRunner.query(
      `ALTER TABLE "registrations" ALTER COLUMN "sequenceNumber" SET DEFAULT nextval('"registrations_sequenceNumber_seq"')`,
    );
    await queryRunner.query(
      `ALTER TABLE "registrations" ADD CONSTRAINT "UQ_14774cf5b1cc9b11a610f48cda5" UNIQUE ("sequenceNumber")`,
    );
    // Note: PostgreSQL cannot drop a value from an enum type, so the
    // 'cancelled' status added in up() is intentionally left in place.
  }
}
