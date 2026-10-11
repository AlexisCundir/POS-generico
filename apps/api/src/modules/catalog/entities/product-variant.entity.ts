import {
    Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Product } from './product.entity.js';
import { StockLot } from '../../inventory/entities/stock-lot.entity.js';

/** Variante = sabor. El stock vive en la variante. Productos sin sabor tienen una sola: 'Estándar'. */
@Entity('product_variants')
@Unique('uq_variant_product_flavor', ['productId', 'flavor'])
export class ProductVariant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    productId: string;

    @ManyToOne(() => Product, (p) => p.variants, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Relation<Product>;

    @Column({ default: 'Estándar' })
    flavor: string;

    @Column({ type: 'varchar', nullable: true, unique: true })
    sku: string | null;

    @Column({ default: true })
    active: boolean;

    @OneToMany(() => StockLot, (l) => l.variant)
    lots: Relation<StockLot[]>;
}