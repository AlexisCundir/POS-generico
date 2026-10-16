import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { money } from '../../../common/transformers.js';

/** Un tipo de envase: 'Botella Paceña', 'Cajón x12'. La garantía es POR PIEZA. */
@Entity('container_types')
export class ContainerType {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    /** Garantía sugerida por pieza (BOB) */
    @Column({ ...money, default: 0 })
    depositAmount: number;

    @Column({ default: true })
    active: boolean;
}