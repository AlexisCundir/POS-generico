import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1791750569167 implements MigrationInterface {
    name = 'Init1791750569167'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('OWNER', 'SELLER')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'SELLER', "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."purchases_paid_from_account_enum" AS ENUM('CASH', 'BANK')`);
        await queryRunner.query(`CREATE TABLE "purchases" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "supplier_name" character varying, "purchased_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "total_cost" numeric(12,2) NOT NULL, "paid_from_account" "public"."purchases_paid_from_account_enum" NOT NULL DEFAULT 'CASH', "notes" text, "created_by_id" uuid NOT NULL, CONSTRAINT "PK_1d55032f37a34c6eceacbbca6b8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "presentations" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "product_id" uuid NOT NULL, "name" character varying NOT NULL, "base_units_qty" numeric(14,4) NOT NULL, "suggested_price" numeric(12,2), "is_sellable" boolean NOT NULL DEFAULT true, "is_purchasable" boolean NOT NULL DEFAULT false, "active" boolean NOT NULL DEFAULT true, CONSTRAINT "uq_presentation_product_name" UNIQUE ("product_id", "name"), CONSTRAINT "CHK_f861648d3f85ef5f1f3628944e" CHECK ("base_units_qty" > 0), CONSTRAINT "PK_3f481051bbd7ae196d0ffa5a644" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "stock_lots" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "purchase_id" uuid NOT NULL, "variant_id" uuid NOT NULL, "purchase_presentation_id" uuid NOT NULL, "packages_purchased" numeric(14,4) NOT NULL, "package_cost" numeric(12,2) NOT NULL, "initial_base_units" numeric(14,4) NOT NULL, "remaining_base_units" numeric(14,4) NOT NULL, "unit_cost" numeric(14,6) NOT NULL, "received_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_256070691a433e348b3b3a630b" CHECK ("remaining_base_units" >= 0), CONSTRAINT "PK_578c4d59145e7d590780f29347b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_lot_fifo" ON "stock_lots"  ("variant_id", "received_at") WHERE "remaining_base_units" > 0`);
        await queryRunner.query(`CREATE TABLE "product_variants" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "product_id" uuid NOT NULL, "flavor" character varying NOT NULL DEFAULT 'Estándar', "sku" character varying, "active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_46f236f21640f9da218a063a866" UNIQUE ("sku"), CONSTRAINT "uq_variant_product_flavor" UNIQUE ("product_id", "flavor"), CONSTRAINT "PK_281e3f2c55652d6a22c0aa59fd7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."products_category_enum" AS ENUM('LICOR', 'CERVEZA', 'CIGARRILLO', 'BEBIDA_ENERGIZANTE', 'SNACK', 'OTRO')`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying NOT NULL, "brand" character varying, "category" "public"."products_category_enum" NOT NULL, "base_unit_name" character varying NOT NULL DEFAULT 'unidad', "has_flavors" boolean NOT NULL DEFAULT false, "is_returnable" boolean NOT NULL DEFAULT false, "deposit_per_unit" numeric(12,2) NOT NULL DEFAULT '0', "low_stock_threshold" numeric(14,4) NOT NULL DEFAULT '0', "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "purchases" ADD CONSTRAINT "FK_fa639f207b2f99db328ddb04c08" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "presentations" ADD CONSTRAINT "FK_e88b6d17aa32ba75d869da4b077" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_lots" ADD CONSTRAINT "FK_09043b69946a725ea41abfd77f2" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_lots" ADD CONSTRAINT "FK_2ef19fe5b5a1fc064bddffce2f3" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_lots" ADD CONSTRAINT "FK_1915caeb2317b2c2bab60bc5103" FOREIGN KEY ("purchase_presentation_id") REFERENCES "presentations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_6343513e20e2deab45edfce1316" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_6343513e20e2deab45edfce1316"`);
        await queryRunner.query(`ALTER TABLE "stock_lots" DROP CONSTRAINT "FK_1915caeb2317b2c2bab60bc5103"`);
        await queryRunner.query(`ALTER TABLE "stock_lots" DROP CONSTRAINT "FK_2ef19fe5b5a1fc064bddffce2f3"`);
        await queryRunner.query(`ALTER TABLE "stock_lots" DROP CONSTRAINT "FK_09043b69946a725ea41abfd77f2"`);
        await queryRunner.query(`ALTER TABLE "presentations" DROP CONSTRAINT "FK_e88b6d17aa32ba75d869da4b077"`);
        await queryRunner.query(`ALTER TABLE "purchases" DROP CONSTRAINT "FK_fa639f207b2f99db328ddb04c08"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TYPE "public"."products_category_enum"`);
        await queryRunner.query(`DROP TABLE "product_variants"`);
        await queryRunner.query(`DROP INDEX "public"."idx_lot_fifo"`);
        await queryRunner.query(`DROP TABLE "stock_lots"`);
        await queryRunner.query(`DROP TABLE "presentations"`);
        await queryRunner.query(`DROP TABLE "purchases"`);
        await queryRunner.query(`DROP TYPE "public"."purchases_paid_from_account_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
