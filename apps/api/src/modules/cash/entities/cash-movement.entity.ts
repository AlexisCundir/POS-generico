import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { CashAccount, CashMovementType } from '../../../common/enums.js';
import { money } from '../../../common/transformers.js';
import { User } from '../../users/entities/user.entity.js';

/**
 * Libro de caja firmado y append-only.
 * Saldo de efectivo = SUM(amount) WHERE account = 'CASH'
 * Saldo de banco    = SUM(amount) WHERE account = 'BANK'
 */
@Entity('cash_movements')
@Index(['occurredAt'])
@Index(['account'])
export class CashMovement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: CashAccount, default: CashAccount.CASH })
    account: CashAccount;

    @Column({ type: 'enum', enum: CashMovementType })
    type: CashMovementType;

    /** + entra, - sale */
    @Column({ ...money })
    amount: number;

    @Column({ type: 'timestamptz', default: () => 'now()' })
    occurredAt: Date;

    /** Qué originó el movimiento: 'sale' | 'purchase' | 'expense' | ... */
    @Column({ type: 'varchar', nullable: true })
    refType: string | null;

    @Column({ type: 'uuid', nullable: true })
    refId: string | null;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @Column({ type: 'uuid' })
    createdById: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by_id' })
    createdBy: Relation<User>;
}