import {
    Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { CashAccount } from '../../../common/enums.js';
import { money } from '../../../common/transformers.js';
import { User } from '../../users/entities/user.entity.js';
import { StockLot } from '../../inventory/entities/stock-lot.entity.js';

@Entity('purchases')
export class Purchase {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    supplierName: string | null;

    @Column({ type: 'timestamptz', default: () => 'now()' })
    purchasedAt: Date;

    @Column({ ...money })
    totalCost: number;

    /** De dónde salió la plata: efectivo o banco */
    @Column({ type: 'enum', enum: CashAccount, default: CashAccount.CASH })
    paidFromAccount: CashAccount;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @Column({ type: 'uuid' })
    createdById: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by_id' })
    createdBy: Relation<User>;

    @OneToMany(() => StockLot, (l) => l.purchase, { cascade: true })
    lots: Relation<StockLot[]>;
}