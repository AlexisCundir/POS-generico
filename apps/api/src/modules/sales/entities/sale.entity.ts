import {
    Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { PaymentMethod, SaleStatus } from '../../../common/enums.js';
import { money } from '../../../common/transformers.js';
import { User } from '../../users/entities/user.entity.js';
import { SaleItem } from './sale-item.entity.js';

@Entity('sales')
@Index(['soldAt'])
export class Sale {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** Idempotencia: el celular genera este UUID; si reintenta por mala señal, no se duplica la venta. */
    @Column({ type: 'uuid', unique: true })
    clientSaleId: string;

    @Column({ type: 'uuid' })
    sellerId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'seller_id' })
    seller: Relation<User>;

    @Column({ type: 'timestamptz', default: () => 'now()' })
    soldAt: Date;

    @Column({ type: 'enum', enum: SaleStatus, default: SaleStatus.COMPLETED })
    status: SaleStatus;

    @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.CASH })
    paymentMethod: PaymentMethod;

    /** Suma de las líneas = ingreso por venta */
    @Column({ ...money })
    itemsTotal: number;

    /** Garantías de envase cobradas (PASIVO, no es ingreso) */
    @Column({ ...money, default: 0 })
    depositTotal: number;

    /** Lo que paga el cliente = itemsTotal + depositTotal */
    @Column({ ...money })
    total: number;

    /** Costo FIFO acumulado de todas las líneas */
    @Column({ ...money })
    totalCost: number;

    /** itemsTotal - totalCost */
    @Column({ ...money })
    grossProfit: number;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @Column({ type: 'timestamptz', nullable: true })
    voidedAt: Date | null;

    @Column({ type: 'uuid', nullable: true })
    voidedById: string | null;

    @Column({ type: 'varchar', nullable: true })
    voidReason: string | null;

    @OneToMany(() => SaleItem, (i) => i.sale, { cascade: true })
    items: Relation<SaleItem[]>;
}