import {
    Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { StockAdjustmentReason } from '../../../common/enums.js';
import { money, qty, unitCostCol } from '../../../common/transformers.js';
import { ProductVariant } from '../../catalog/entities/product-variant.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { StockLot } from './stock-lot.entity.js';

@Entity('stock_adjustments')
@Index(['createdAt'])
export class StockAdjustment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    variantId: string;

    @ManyToOne(() => ProductVariant)
    @JoinColumn({ name: 'variant_id' })
    variant: Relation<ProductVariant>;

    @Column({ type: 'uuid' })
    lotId: string;

    @ManyToOne(() => StockLot)
    @JoinColumn({ name: 'lot_id' })
    lot: Relation<StockLot>;

    /** Unidades base retiradas del lote (siempre positivo) */
    @Column({ ...qty })
    baseUnits: number;

    @Column({ ...unitCostCol })
    unitCost: number;

    /** Valor de la pérdida a precio de costo */
    @Column({ ...money })
    totalCost: number;

    @Column({ type: 'enum', enum: StockAdjustmentReason })
    reason: StockAdjustmentReason;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @Column({ type: 'uuid' })
    createdById: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by_id' })
    createdBy: Relation<User>;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}