import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { CashAccount, ExpenseType } from '../../../common/enums.js';
import { money } from '../../../common/transformers.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('expenses')
@Index(['incurredAt'])
export class Expense {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: ExpenseType })
    type: ExpenseType;

    /** 'Bolsas', 'Vasos', 'Pasajes', 'Alquiler', 'Luz', 'Intereses banco' */
    @Column()
    category: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ ...money })
    amount: number;

    @Column({ type: 'timestamptz', default: () => 'now()' })
    incurredAt: Date;

    @Column({ default: false })
    isRecurring: boolean;

    /** De dónde salió el dinero */
    @Column({ type: 'enum', enum: CashAccount, default: CashAccount.CASH })
    paidFromAccount: CashAccount;

    @Column({ type: 'uuid' })
    createdById: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by_id' })
    createdBy: Relation<User>;
}