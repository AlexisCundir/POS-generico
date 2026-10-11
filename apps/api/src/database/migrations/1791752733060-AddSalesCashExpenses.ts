import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSalesCashExpenses1791752733060 implements MigrationInterface {
    name = 'AddSalesCashExpenses1791752733060'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."stock_adjustments_reason_enum" AS ENUM('BREAKAGE', 'EXPIRED', 'OWN_CONSUMPTION', 'LOSS', 'COUNT_CORRECTION')`);
        await queryRunner.query(`CREATE TABLE "stock_adjustments" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "variant_id" uuid NOT NULL, "lot_id" uuid NOT NULL, "base_units" numeric(14,4) NOT NULL, "unit_cost" numeric(14,6) NOT NULL, "total_cost" numeric(12,2) NOT NULL, "reason" "public"."stock_adjustments_reason_enum" NOT NULL, "notes" text, "created_by_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7dc03d92f242dd489d33b80d063" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0ebc6e598874ba2aa7783fed01" ON "stock_adjustments"  ("created_at") `);
        await queryRunner.query(`CREATE TABLE "sale_item_lots" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "sale_item_id" uuid NOT NULL, "lot_id" uuid NOT NULL, "base_units" numeric(14,4) NOT NULL, "unit_cost" numeric(14,6) NOT NULL, "cost_subtotal" numeric(12,2) NOT NULL, CONSTRAINT "PK_3c2d05ba03173ee100bae23f1f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8840982740c7c99aab84c4678c" ON "sale_item_lots"  ("sale_item_id") `);
        await queryRunner.query(`CREATE TABLE "sale_items" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "sale_id" uuid NOT NULL, "variant_id" uuid NOT NULL, "presentation_id" uuid NOT NULL, "quantity" numeric(14,4) NOT NULL, "base_units_consumed" numeric(14,4) NOT NULL, "suggested_unit_price" numeric(12,2) NOT NULL, "agreed_unit_price" numeric(12,2) NOT NULL, "line_total" numeric(12,2) NOT NULL, "cost_total" numeric(12,2) NOT NULL, "gross_profit" numeric(12,2) NOT NULL, "empties_returned" integer NOT NULL DEFAULT '0', "deposit_charged" numeric(12,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_5a7dc5b4562a9e590528b3e08ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8a27886f7a349f48572087f91d" ON "sale_items"  ("variant_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c210a330b80232c29c2ad68462" ON "sale_items"  ("sale_id") `);
        await queryRunner.query(`CREATE TYPE "public"."sales_status_enum" AS ENUM('COMPLETED', 'VOIDED')`);
        await queryRunner.query(`CREATE TYPE "public"."sales_payment_method_enum" AS ENUM('CASH', 'QR', 'TRANSFER')`);
        await queryRunner.query(`CREATE TABLE "sales" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "client_sale_id" uuid NOT NULL, "seller_id" uuid NOT NULL, "sold_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "status" "public"."sales_status_enum" NOT NULL DEFAULT 'COMPLETED', "payment_method" "public"."sales_payment_method_enum" NOT NULL DEFAULT 'CASH', "items_total" numeric(12,2) NOT NULL, "deposit_total" numeric(12,2) NOT NULL DEFAULT '0', "total" numeric(12,2) NOT NULL, "total_cost" numeric(12,2) NOT NULL, "gross_profit" numeric(12,2) NOT NULL, "notes" text, "voided_at" TIMESTAMP WITH TIME ZONE, "voided_by_id" uuid, "void_reason" character varying, CONSTRAINT "UQ_ec4bbb0516096f4f2c9bec9373b" UNIQUE ("client_sale_id"), CONSTRAINT "PK_4f0bc990ae81dba46da680895ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_00132794043f70cb744fae7a74" ON "sales"  ("sold_at") `);
        await queryRunner.query(`CREATE TYPE "public"."deposit_ledger_type_enum" AS ENUM('CHARGED', 'REFUNDED')`);
        await queryRunner.query(`CREATE TABLE "deposit_ledger" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "type" "public"."deposit_ledger_type_enum" NOT NULL, "amount" numeric(12,2) NOT NULL, "containers" integer NOT NULL DEFAULT '1', "sale_id" uuid, "notes" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c62dbaf66e4f88565e3d3bcf1d8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."container_movements_type_enum" AS ENUM('CUSTOMER_RETURN', 'SUPPLIER_RETURN', 'BREAKAGE', 'ADJUSTMENT')`);
        await queryRunner.query(`CREATE TABLE "container_movements" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "product_id" uuid NOT NULL, "type" "public"."container_movements_type_enum" NOT NULL, "quantity" integer NOT NULL, "sale_id" uuid, "notes" text, "created_by_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_2a05e6391e398a7c37ac366a9cd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."expenses_type_enum" AS ENUM('HORMIGA', 'FIJO', 'FINANCIERO')`);
        await queryRunner.query(`CREATE TYPE "public"."expenses_paid_from_account_enum" AS ENUM('CASH', 'BANK')`);
        await queryRunner.query(`CREATE TABLE "expenses" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "type" "public"."expenses_type_enum" NOT NULL, "category" character varying NOT NULL, "description" text, "amount" numeric(12,2) NOT NULL, "incurred_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "is_recurring" boolean NOT NULL DEFAULT false, "paid_from_account" "public"."expenses_paid_from_account_enum" NOT NULL DEFAULT 'CASH', "created_by_id" uuid NOT NULL, CONSTRAINT "PK_94c3ceb17e3140abc9282c20610" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_470444e61950aaeff6e87dc114" ON "expenses"  ("incurred_at") `);
        await queryRunner.query(`CREATE TYPE "public"."cash_movements_account_enum" AS ENUM('CASH', 'BANK')`);
        await queryRunner.query(`CREATE TYPE "public"."cash_movements_type_enum" AS ENUM('SALE', 'DEPOSIT_IN', 'DEPOSIT_REFUND', 'PURCHASE', 'EXPENSE', 'LOAN_PRINCIPAL', 'OWNER_CONTRIBUTION', 'OWNER_WITHDRAWAL', 'TRANSFER_BETWEEN_ACCOUNTS', 'ADJUSTMENT')`);
        await queryRunner.query(`CREATE TABLE "cash_movements" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "account" "public"."cash_movements_account_enum" NOT NULL DEFAULT 'CASH', "type" "public"."cash_movements_type_enum" NOT NULL, "amount" numeric(12,2) NOT NULL, "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "ref_type" character varying, "ref_id" uuid, "notes" text, "created_by_id" uuid NOT NULL, CONSTRAINT "PK_25faead19e1ff74153a01604d37" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ae4b65cec76a22258645cf1bb4" ON "cash_movements"  ("account") `);
        await queryRunner.query(`CREATE INDEX "IDX_88c1a98edc884b245837d5180e" ON "cash_movements"  ("occurred_at") `);
        await queryRunner.query(`CREATE TABLE "daily_cash_closes" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "business_date" date NOT NULL, "opening_cash" numeric(12,2) NOT NULL, "expected_cash" numeric(12,2) NOT NULL, "counted_cash" numeric(12,2) NOT NULL, "difference" numeric(12,2) NOT NULL, "notes" text, "closed_by_id" uuid NOT NULL, "closed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_9e2dc9856492a2c9e5ad1229fda" UNIQUE ("business_date"), CONSTRAINT "PK_ff204af0ea6465c72af99a7500b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "stock_adjustments" ADD CONSTRAINT "FK_bb862b206687ba35b00c7e59014" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_adjustments" ADD CONSTRAINT "FK_9845c67d41d35006bcb745d6c96" FOREIGN KEY ("lot_id") REFERENCES "stock_lots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_adjustments" ADD CONSTRAINT "FK_230fd9389014effcb11fdfb696c" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sale_item_lots" ADD CONSTRAINT "FK_8840982740c7c99aab84c4678c7" FOREIGN KEY ("sale_item_id") REFERENCES "sale_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sale_item_lots" ADD CONSTRAINT "FK_0dce26c04a23347e54c7a5b7d25" FOREIGN KEY ("lot_id") REFERENCES "stock_lots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sale_items" ADD CONSTRAINT "FK_c210a330b80232c29c2ad68462a" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sale_items" ADD CONSTRAINT "FK_8a27886f7a349f48572087f91da" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sale_items" ADD CONSTRAINT "FK_82ac4b69d1a4a237abf9c52b179" FOREIGN KEY ("presentation_id") REFERENCES "presentations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sales" ADD CONSTRAINT "FK_fbcb737b3ecc7c968b0dc167122" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "deposit_ledger" ADD CONSTRAINT "FK_141f850ad5851c32dbbfd59e5b8" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "container_movements" ADD CONSTRAINT "FK_4abd3a08e562394743b3fc274ca" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "container_movements" ADD CONSTRAINT "FK_4fe8105a889653d9f2876ecaa33" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD CONSTRAINT "FK_cb8a9ecdb628ea1befdbaf6e078" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cash_movements" ADD CONSTRAINT "FK_e4d24312cccdc2ddb8f04a0af1b" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cash_movements" DROP CONSTRAINT "FK_e4d24312cccdc2ddb8f04a0af1b"`);
        await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_cb8a9ecdb628ea1befdbaf6e078"`);
        await queryRunner.query(`ALTER TABLE "container_movements" DROP CONSTRAINT "FK_4fe8105a889653d9f2876ecaa33"`);
        await queryRunner.query(`ALTER TABLE "container_movements" DROP CONSTRAINT "FK_4abd3a08e562394743b3fc274ca"`);
        await queryRunner.query(`ALTER TABLE "deposit_ledger" DROP CONSTRAINT "FK_141f850ad5851c32dbbfd59e5b8"`);
        await queryRunner.query(`ALTER TABLE "sales" DROP CONSTRAINT "FK_fbcb737b3ecc7c968b0dc167122"`);
        await queryRunner.query(`ALTER TABLE "sale_items" DROP CONSTRAINT "FK_82ac4b69d1a4a237abf9c52b179"`);
        await queryRunner.query(`ALTER TABLE "sale_items" DROP CONSTRAINT "FK_8a27886f7a349f48572087f91da"`);
        await queryRunner.query(`ALTER TABLE "sale_items" DROP CONSTRAINT "FK_c210a330b80232c29c2ad68462a"`);
        await queryRunner.query(`ALTER TABLE "sale_item_lots" DROP CONSTRAINT "FK_0dce26c04a23347e54c7a5b7d25"`);
        await queryRunner.query(`ALTER TABLE "sale_item_lots" DROP CONSTRAINT "FK_8840982740c7c99aab84c4678c7"`);
        await queryRunner.query(`ALTER TABLE "stock_adjustments" DROP CONSTRAINT "FK_230fd9389014effcb11fdfb696c"`);
        await queryRunner.query(`ALTER TABLE "stock_adjustments" DROP CONSTRAINT "FK_9845c67d41d35006bcb745d6c96"`);
        await queryRunner.query(`ALTER TABLE "stock_adjustments" DROP CONSTRAINT "FK_bb862b206687ba35b00c7e59014"`);
        await queryRunner.query(`DROP TABLE "daily_cash_closes"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_88c1a98edc884b245837d5180e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ae4b65cec76a22258645cf1bb4"`);
        await queryRunner.query(`DROP TABLE "cash_movements"`);
        await queryRunner.query(`DROP TYPE "public"."cash_movements_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."cash_movements_account_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_470444e61950aaeff6e87dc114"`);
        await queryRunner.query(`DROP TABLE "expenses"`);
        await queryRunner.query(`DROP TYPE "public"."expenses_paid_from_account_enum"`);
        await queryRunner.query(`DROP TYPE "public"."expenses_type_enum"`);
        await queryRunner.query(`DROP TABLE "container_movements"`);
        await queryRunner.query(`DROP TYPE "public"."container_movements_type_enum"`);
        await queryRunner.query(`DROP TABLE "deposit_ledger"`);
        await queryRunner.query(`DROP TYPE "public"."deposit_ledger_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_00132794043f70cb744fae7a74"`);
        await queryRunner.query(`DROP TABLE "sales"`);
        await queryRunner.query(`DROP TYPE "public"."sales_payment_method_enum"`);
        await queryRunner.query(`DROP TYPE "public"."sales_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c210a330b80232c29c2ad68462"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8a27886f7a349f48572087f91d"`);
        await queryRunner.query(`DROP TABLE "sale_items"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8840982740c7c99aab84c4678c"`);
        await queryRunner.query(`DROP TABLE "sale_item_lots"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0ebc6e598874ba2aa7783fed01"`);
        await queryRunner.query(`DROP TABLE "stock_adjustments"`);
        await queryRunner.query(`DROP TYPE "public"."stock_adjustments_reason_enum"`);
    }

}
