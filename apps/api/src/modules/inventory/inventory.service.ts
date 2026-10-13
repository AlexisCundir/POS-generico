import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { ProductVariant } from '../catalog/entities/product-variant.entity.js';
import { StockLot } from './entities/stock-lot.entity.js';

interface StockRow {
    variantId: string;
    productName: string;
    flavor: string;
    baseUnitName: string;
    lowStockThreshold: string;
    stockBase: string;
    valueAtCost: string;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

@Injectable()
export class InventoryService {
    constructor(
        @InjectRepository(ProductVariant) private readonly variants: Repository<ProductVariant>,
        @InjectRepository(StockLot) private readonly lots: Repository<StockLot>,
    ) { }

    /** Stock en unidades base y valor a costo, por variante */
    async getStock() {
        const rows = await this.variants
            .createQueryBuilder('v')
            .innerJoin('v.product', 'p')
            .leftJoin('v.lots', 'l')
            .select('v.id', 'variantId')
            .addSelect('p.name', 'productName')
            .addSelect('v.flavor', 'flavor')
            .addSelect('p.base_unit_name', 'baseUnitName')
            .addSelect('p.low_stock_threshold', 'lowStockThreshold')
            .addSelect('COALESCE(SUM(l.remaining_base_units), 0)', 'stockBase')
            .addSelect('COALESCE(SUM(l.remaining_base_units * l.unit_cost), 0)', 'valueAtCost')
            .where('v.active = true')
            .groupBy('v.id')
            .addGroupBy('p.id')
            .orderBy('p.name', 'ASC')
            .addOrderBy('v.flavor', 'ASC')
            .getRawMany<StockRow>();

        const items = rows.map((r) => {
            const stockBase = Number(r.stockBase);
            const threshold = Number(r.lowStockThreshold);
            return {
                variantId: r.variantId,
                productName: r.productName,
                flavor: r.flavor,
                baseUnitName: r.baseUnitName,
                stockBase,
                valueAtCost: round2(Number(r.valueAtCost)),
                isLow: threshold > 0 && stockBase <= threshold,
            };
        });

        return {
            items,
            totalValueAtCost: round2(items.reduce((sum, i) => sum + i.valueAtCost, 0)),
        };
    }

    /** Lotes con stock de una variante, en el orden en que el FIFO los consumirá */
    getLots(variantId: string): Promise<StockLot[]> {
        return this.lots.find({
            where: { variantId, remainingBaseUnits: MoreThan(0) },
            order: { receivedAt: 'ASC', id: 'ASC' },
        });
    }
}