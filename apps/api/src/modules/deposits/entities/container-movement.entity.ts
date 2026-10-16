import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { ContainerMovementType } from '../../../common/enums.js';
import { User } from '../../users/entities/user.entity.js';
import { ContainerType } from './container-type.entity.js';

/** Stock de envases VACÍOS en tienda = SUM(quantity) por tipo. */
@Entity('container_movements')
export class ContainerMovement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    containerTypeId: string;

    @ManyToOne(() => ContainerType)
    @JoinColumn({ name: 'container_type_id' })
    containerType: Relation<ContainerType>;

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