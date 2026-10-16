import { MigrationInterface, QueryRunner } from "typeorm";

export class ContainerTypes1792188686187 implements MigrationInterface {
    name = 'ContainerTypes1792188686187'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "container_movements" DROP CONSTRAINT "FK_4abd3a08e562394743b3fc274ca"`);
        await queryRunner.query(`ALTER TABLE "container_movements" RENAME COLUMN "product_id" TO "container_type_id"`);
        await queryRunner.query(`CREATE TABLE "container_types" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying NOT NULL, "deposit_amount" numeric(12,2) NOT NULL DEFAULT '0', "active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_a9687065caa14bbb3ef77f97b50" UNIQUE ("name"), CONSTRAINT "PK_50e6b62fcd07ba58bdb6415d47c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "presentation_containers" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "presentation_id" uuid NOT NULL, "container_type_id" uuid NOT NULL, "quantity" integer NOT NULL, CONSTRAINT "uq_presentation_container" UNIQUE ("presentation_id", "container_type_id"), CONSTRAINT "CHK_e581acb9bc275ba534c428248e" CHECK ("quantity" > 0), CONSTRAINT "PK_5f996fe3b20d02f714c010accf6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sale_containers" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "sale_id" uuid NOT NULL, "container_type_id" uuid NOT NULL, "taken" integer NOT NULL, "returned" integer NOT NULL DEFAULT '0', CONSTRAINT "uq_sale_container_type" UNIQUE ("sale_id", "container_type_id"), CONSTRAINT "PK_abd507b34d875bd2461b858e67b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "is_returnable"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "deposit_per_unit"`);
        await queryRunner.query(`ALTER TABLE "sale_items" DROP COLUMN "empties_returned"`);
        await queryRunner.query(`ALTER TABLE "sale_items" DROP COLUMN "deposit_charged"`);
        await queryRunner.query(`ALTER TABLE "sales" ADD "suggested_deposit" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "presentation_containers" ADD CONSTRAINT "FK_08dc64698828f6542801f0113e0" FOREIGN KEY ("presentation_id") REFERENCES "presentations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "presentation_containers" ADD CONSTRAINT "FK_db4d43b8d9429984bb59f11da34" FOREIGN KEY ("container_type_id") REFERENCES "container_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sale_containers" ADD CONSTRAINT "FK_8a041835a3115d6ba9209a82cea" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sale_containers" ADD CONSTRAINT "FK_2b561dd94948b1e78565ea4f5c6" FOREIGN KEY ("container_type_id") REFERENCES "container_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "container_movements" ADD CONSTRAINT "FK_ca105da720dba6f02b4756e439b" FOREIGN KEY ("container_type_id") REFERENCES "container_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "container_movements" DROP CONSTRAINT "FK_ca105da720dba6f02b4756e439b"`);
        await queryRunner.query(`ALTER TABLE "sale_containers" DROP CONSTRAINT "FK_2b561dd94948b1e78565ea4f5c6"`);
        await queryRunner.query(`ALTER TABLE "sale_containers" DROP CONSTRAINT "FK_8a041835a3115d6ba9209a82cea"`);
        await queryRunner.query(`ALTER TABLE "presentation_containers" DROP CONSTRAINT "FK_db4d43b8d9429984bb59f11da34"`);
        await queryRunner.query(`ALTER TABLE "presentation_containers" DROP CONSTRAINT "FK_08dc64698828f6542801f0113e0"`);
        await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN "suggested_deposit"`);
        await queryRunner.query(`ALTER TABLE "sale_items" ADD "deposit_charged" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "sale_items" ADD "empties_returned" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "products" ADD "deposit_per_unit" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "products" ADD "is_returnable" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`DROP TABLE "sale_containers"`);
        await queryRunner.query(`DROP TABLE "presentation_containers"`);
        await queryRunner.query(`DROP TABLE "container_types"`);
        await queryRunner.query(`ALTER TABLE "container_movements" RENAME COLUMN "container_type_id" TO "product_id"`);
        await queryRunner.query(`ALTER TABLE "container_movements" ADD CONSTRAINT "FK_4abd3a08e562394743b3fc274ca" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
