import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRegistrationAndEvents1786277265644 implements MigrationInterface {
    name = 'CreateRegistrationAndEvents1786277265644'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "events" ("id" SERIAL NOT NULL, "cmsId" integer NOT NULL, "capacity" integer NOT NULL, "confirmedCount" integer NOT NULL, "registrationStartsAt" TIMESTAMP NOT NULL, "registrationEndsAt" TIMESTAMP NOT NULL, "status" character varying NOT NULL, CONSTRAINT "UQ_98ea70af6c105f0ba7b013e4e13" UNIQUE ("cmsId"), CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."registrations_status_enum" AS ENUM('confirmed', 'waitlisted')`);
        await queryRunner.query(`CREATE TABLE "registrations" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "eventId" integer NOT NULL, "status" "public"."registrations_status_enum" NOT NULL, "sequenceNumber" BIGSERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_14774cf5b1cc9b11a610f48cda5" UNIQUE ("sequenceNumber"), CONSTRAINT "UQ_133db113646ed250e71d661bc3e" UNIQUE ("userId", "eventId"), CONSTRAINT "PK_6013e724d7b22929da9cd7282d1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_33b916170cd8e0fb0107c52b9b" ON "registrations" ("eventId", "status", "sequenceNumber") `);
        await queryRunner.query(`CREATE TYPE "public"."cancellations_previousstatus_enum" AS ENUM('confirmed', 'waitlisted')`);
        await queryRunner.query(`CREATE TABLE "cancellations" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "eventId" integer NOT NULL, "previousStatus" "public"."cancellations_previousstatus_enum" NOT NULL, "sequenceNumber" bigint NOT NULL, "cancelledAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a4cc24d65fd356b0781f9a3daed" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "registrations" ADD CONSTRAINT "FK_7e5ae7aa55bb98b8b9dcbe32ca3" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "registrations" ADD CONSTRAINT "FK_06a49e76b60cac63e04b81eb1a9" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cancellations" ADD CONSTRAINT "FK_1c8021007b07f37abcb0c3f2910" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cancellations" ADD CONSTRAINT "FK_66d3288df2217fbe8b93423a332" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cancellations" DROP CONSTRAINT "FK_66d3288df2217fbe8b93423a332"`);
        await queryRunner.query(`ALTER TABLE "cancellations" DROP CONSTRAINT "FK_1c8021007b07f37abcb0c3f2910"`);
        await queryRunner.query(`ALTER TABLE "registrations" DROP CONSTRAINT "FK_06a49e76b60cac63e04b81eb1a9"`);
        await queryRunner.query(`ALTER TABLE "registrations" DROP CONSTRAINT "FK_7e5ae7aa55bb98b8b9dcbe32ca3"`);
        await queryRunner.query(`DROP TABLE "cancellations"`);
        await queryRunner.query(`DROP TYPE "public"."cancellations_previousstatus_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_33b916170cd8e0fb0107c52b9b"`);
        await queryRunner.query(`DROP TABLE "registrations"`);
        await queryRunner.query(`DROP TYPE "public"."registrations_status_enum"`);
        await queryRunner.query(`DROP TABLE "events"`);
    }

}
