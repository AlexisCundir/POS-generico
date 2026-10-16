import {
    Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { money, qty } from '../../../common/transformers.js';
import { ProductVariant } from '../../catalog/entities/product-variant.entity.js';
import { Presentation } from '../../catalog/entities/presentation.entity.js';
import { Sale } from './sale.entity.js';
import { SaleItemLot } from './sale-item-lot.entity.js';

@Entity('sale_items')
@Index(['saleId'])
@Index(['variantId'])
export class SaleItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    saleId: string;

    @ManyToOne(() => Sale, (s) => s.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sale_id' })
    sale: Relation<Sale>;

    /** Variante (sabor): base de los reportes de rotación */
    @Column({ type: 'uuid' })
    variantId: string;

    @ManyToOne(() => ProductVariant)
    @JoinColumn({ name: 'variant_id' })
    variant: Relation<ProductVariant>;

    @Column({ type: 'uuid' })
    presentationId: string;

    @ManyToOne(() => Presentation)
    @JoinColumn({ name: 'presentation_id' })
    presentation: Relation<Presentation>;

    /** Cantidad en la presentación vendida (3 sueltos, 1 cajetilla) */
    @Column({ ...qty })
    quantity: number;

    /** quantity × baseUnitsQty, guardado como snapshot */
    @Column({ ...qty })
    baseUnitsConsumed: number;

    /** Precio sugerido al momento de vender (snapshot) */
    @Column({ ...money })
    suggestedUnitPrice: number;

    /** Precio realmente pactado (puede diferir del sugerido) */
    @Column({ ...money })
    agreedUnitPrice: number;

    @Column({ ...money })
    lineTotal: number;

    @Column({ ...money })
    costTotal: number;

    /** lineTotal - costTotal. Si es negativo, se vendió bajo costo. */
    @Column({ ...money })
    grossProfit: number;

    /*
    //  Envases vacíos que trajo el cliente
    @Column({ type: 'int', default: 0 })
    emptiesReturned: number;

    @Column({ ...money, default: 0 })
    depositCharged: number;
    */

    @OneToMany(() => SaleItemLot, (c) => c.saleItem, { cascade: true })
    consumptions: Relation<SaleItemLot[]>;
}