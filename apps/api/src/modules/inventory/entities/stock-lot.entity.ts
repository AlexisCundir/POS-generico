import {
    Check, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { money, qty, unitCostCol } from '../../../common/transformers.js';
import { Purchase } from '../../purchasing/entities/purchase.entity.js';
import { ProductVariant } from '../../catalog/entities/product-variant.entity.js';
import { Presentation } from '../../catalog/entities/presentation.entity.js';

/**
 * Cada línea de compra crea un lote.
 * Ej: 1 fajo de cigarrillos a 160 → initial=200, remaining=200, unitCost=0.8
 */
@Entity('stock_lots')
@Index('idx_lot_fifo', ['variantId', 'receivedAt'], {
    where: '"remaining_base_units" > 0',
})
@Check('"remaining_base_units" >= 0')
export class StockLot {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    purchaseId: string;

    @ManyToOne(() => Purchase, (p) => p.lots, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'purchase_id' })
    purchase: Relation<Purchase>;

    @Column({ type: 'uuid' })
    variantId: string;

    @ManyToOne(() => ProductVariant, (v) => v.lots)
    @JoinColumn({ name: 'variant_id' })
    variant: Relation<ProductVariant>;

    @Column({ type: 'uuid' })
    purchasePresentationId: string;

    @ManyToOne(() => Presentation)
    @JoinColumn({ name: 'purchase_presentation_id' })
    purchasePresentation: Relation<Presentation>;

    /** Paquetes comprados: 1 fajo, 3 paquetes */
    @Column({ ...qty })
    packagesPurchased: number;

    /** Costo por paquete: 160, 120 */
    @Column({ ...money })
    packageCost: number;

    @Column({ ...qty })
    initialBaseUnits: number;

    /** Se decrementa con cada venta */
    @Column({ ...qty })
    remainingBaseUnits: number;

    /** packageCost / baseUnitsQty */
    @Column({ ...unitCostCol })
    unitCost: number;

    @Column({ type: 'timestamptz', default: () => 'now()' })
    receivedAt: Date;
}