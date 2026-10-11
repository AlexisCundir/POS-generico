import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { money } from '../../../common/transformers.js';

@Entity('daily_cash_closes')
export class DailyCashClose {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** Un solo cierre por día */
    @Column({ type: 'date', unique: true })
    businessDate: string;

    @Column({ ...money })
    openingCash: number;

    /** Calculado por el servidor desde cash_movements (cuenta CASH) */
    @Column({ ...money })
    expectedCash: number;

    /** Lo que contó físicamente el dueño */
    @Column({ ...money })
    countedCash: number;

    /** counted - expected */
    @Column({ ...money })
    difference: number;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @Column({ type: 'uuid' })
    closedById: string;

    @CreateDateColumn({ type: 'timestamptz' })
    closedAt: Date;
}