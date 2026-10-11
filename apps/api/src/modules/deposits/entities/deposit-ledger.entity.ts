import {
    Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { DepositEntryType } from '../../../common/enums.js';
import { money } from '../../../common/transformers.js';
import { Sale } from '../../sales/entities/sale.entity.js';

@Entity('deposit_ledger')
export class DepositLedger {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: DepositEntryType })
    type: DepositEntryType;

    /** Siempre positivo; el tipo (CHARGED/REFUNDED) define si suma o resta */
    @Column({ ...money })
    amount: number;

    @Column({ type: 'int', default: 1 })
    containers: number;

    @Column({ type: 'uuid', nullable: true })
    saleId: string | null;

    @ManyToOne(() => Sale, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'sale_id' })
    sale: Relation<Sale> | null;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}