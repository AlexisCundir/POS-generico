import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { money, qty, unitCostCol } from '../../../common/transformers.js';
import { StockLot } from '../../inventory/entities/stock-lot.entity.js';
import { SaleItem } from './sale-item.entity.js';

@Entity('sale_item_lots')
@Index(['saleItemId'])
export class SaleItemLot {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    saleItemId: string;

    @ManyToOne(() => SaleItem, (i) => i.consumptions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sale_item_id' })
    saleItem: Relation<SaleItem>;

    @Column({ type: 'uuid' })
    lotId: string;

    @ManyToOne(() => StockLot)
    @JoinColumn({ name: 'lot_id' })
    lot: Relation<StockLot>;

    @Column({ ...qty })
    baseUnits: number;

    /** Costo del lote al momento de la venta (snapshot) */
    @Column({ ...unitCostCol })
    unitCost: number;

    @Column({ ...money })
    costSubtotal: number;
}