import {
    Check, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { money, qty } from '../../../common/transformers.js';
import { Product } from './product.entity.js';

/** Forma de comprar/vender. baseUnitsQty = cuántas unidades base contiene. */
@Entity('presentations')
@Unique('uq_presentation_product_name', ['productId', 'name'])
@Check('"base_units_qty" > 0')
export class Presentation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    productId: string;

    @ManyToOne(() => Product, (p) => p.presentations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Relation<Product>;

    /** 'Fajo x10', 'Cajetilla', 'Suelto', 'Paquete x12', 'Lata' */
    @Column()
    name: string;

    /** 200, 20, 1, 12, 1 */
    @Column({ ...qty })
    baseUnitsQty: number;

    @Column({ ...money, nullable: true })
    suggestedPrice: number | null;

    @Column({ default: true })
    isSellable: boolean;

    @Column({ default: false })
    isPurchasable: boolean;

    @Column({ default: true })
    active: boolean;
}