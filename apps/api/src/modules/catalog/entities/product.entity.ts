import {
    Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { ProductCategory } from '../../../common/enums.js';
import { money, qty } from '../../../common/transformers.js';
import { ProductVariant } from './product-variant.entity.js';
import { Presentation } from './presentation.entity.js';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string; // "Four Loko", "Marlboro", "Whisky W"

    @Column({ type: 'varchar', nullable: true })
    brand: string | null;

    @Column({ type: 'enum', enum: ProductCategory })
    category: ProductCategory;

    /** Nombre de la unidad base: 'cigarrillo', 'lata', 'botella' */
    @Column({ default: 'unidad' })
    baseUnitName: string;

    @Column({ default: false })
    hasFlavors: boolean;

    /*
    // Envase de vidrio retornable (genera garantía si el cliente no trae vacío)
    @Column({ default: false })
    isReturnable: boolean;

    @Column({ ...money, default: 0 })
    depositPerUnit: number;
    /*

    /** Alerta de stock bajo, en unidades base */
    @Column({ ...qty, default: 0 })
    lowStockThreshold: number;

    @Column({ default: true })
    active: boolean;

    @OneToMany(() => ProductVariant, (v) => v.product, { cascade: true })
    variants: Relation<ProductVariant[]>;

    @OneToMany(() => Presentation, (p) => p.product, { cascade: true })
    presentations: Relation<Presentation[]>;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}