import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import type { Relation } from 'typeorm';
import { ContainerType } from '../../deposits/entities/container-type.entity.js';
import { Presentation } from './presentation.entity.js';

/** Qué envases lleva UNA unidad de esta presentación. Caja x12 => 12 botellas + 1 cajón. */
@Entity('presentation_containers')
@Unique('uq_presentation_container', ['presentationId', 'containerTypeId'])
@Check('"quantity" > 0')
export class PresentationContainer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    presentationId: string;

    @ManyToOne(() => Presentation, (p) => p.containers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'presentation_id' })
    presentation: Relation<Presentation>;

    @Column({ type: 'uuid' })
    containerTypeId: string;

    @ManyToOne(() => ContainerType)
    @JoinColumn({ name: 'container_type_id' })
    containerType: Relation<ContainerType>;

    @Column({ type: 'int' })
    quantity: number;
}