import {
    Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { ContainerMovementType } from '../../../common/enums.js';
import { Product } from '../../catalog/entities/product.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('container_movements')
export class ContainerMovement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    productId: string;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Relation<Product>;

    @Column({ type: 'enum', enum: ContainerMovementType })
    type: ContainerMovementType;

    /** + entra, - sale */
    @Column({ type: 'int' })
    quantity: number;

    @Column({ type: 'uuid', nullable: true })
    saleId: string | null;

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