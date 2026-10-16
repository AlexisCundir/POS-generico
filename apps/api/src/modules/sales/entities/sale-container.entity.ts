import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import type { Relation } from 'typeorm';
import { ContainerType } from '../../deposits/entities/container-type.entity.js';
import { Sale } from './sale.entity.js';

/** Resumen de envases de una venta, por tipo. Pendientes = taken - returned. */
@Entity('sale_containers')
@Unique('uq_sale_container_type', ['saleId', 'containerTypeId'])
export class SaleContainer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    saleId: string;

    @ManyToOne(() => Sale, (s) => s.containers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sale_id' })
    sale: Relation<Sale>;

    @Column({ type: 'uuid' })
    containerTypeId: string;

    @ManyToOne(() => ContainerType)
    @JoinColumn({ name: 'container_type_id' })
    containerType: Relation<ContainerType>;

    /** Envases que el cliente se lleva dentro de lo vendido */
    @Column({ type: 'int' })
    taken: number;

    /** Envases vacíos que trajo a cambio */
    @Column({ type: 'int', default: 0 })
    returned: number;
}