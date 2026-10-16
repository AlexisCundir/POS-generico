import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { EntityManager } from 'typeorm';
import { Decimal } from 'decimal.js';
import {
    CashAccount, CashMovementType, ContainerMovementType, DepositEntryType,
} from '../../common/enums.js';
import { CashMovement } from '../cash/entities/cash-movement.entity.js';
import { ContainerMovement } from './entities/container-movement.entity.js';
import { ContainerType } from './entities/container-type.entity.js';
import { DepositLedger } from './entities/deposit-ledger.entity.js';
import type { ContainerTypeCreate, ContainerTypeUpdate, RefundCreate } from './schemas/deposit.schemas.js';

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

@Injectable()
export class DepositsService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(ContainerType) private readonly types: Repository<ContainerType>,
    ) { }

    // ───────── Tipos de envase ─────────
    async createType(dto: ContainerTypeCreate): Promise<ContainerType> {
        await this.assertNameFree(dto.name);
        return this.types.save(this.types.create(dto));
    }

    findTypes(): Promise<ContainerType[]> {
        return this.types.find({ order: { name: 'ASC' } });
    }

    async updateType(id: string, dto: ContainerTypeUpdate): Promise<ContainerType> {
        const type = await this.types.findOne({ where: { id } });
        if (!type) throw new NotFoundException('Tipo de envase no encontrado');
        if (dto.name) await this.assertNameFree(dto.name, id);
        Object.assign(type, dto);
        return this.types.save(type);
    }

    // ───────── Devolución de garantías ─────────
    async refund(dto: RefundCreate, userId: string) {
        return this.dataSource.transaction(async (manager) => {
            // Un reembolso a la vez: evita que dos devoluciones simultáneas pasen el control de saldo
            await manager.query(`SELECT pg_advisory_xact_lock(hashtext('deposit_refund'))`);

            let suggested = new Decimal(0);
            let totalContainers = 0;
            const movements: ContainerMovement[] = [];

            for (const item of dto.items) {
                const type = await manager.findOne(ContainerType, { where: { id: item.containerTypeId } });
                if (!type) throw new NotFoundException('El tipo de envase no existe');
                suggested = suggested.plus(new Decimal(type.depositAmount).mul(item.quantity));
                totalContainers += item.quantity;
                movements.push(
                    manager.create(ContainerMovement, {
                        containerTypeId: type.id,
                        type: ContainerMovementType.CUSTOMER_RETURN,
                        quantity: item.quantity,
                        notes: dto.notes ?? 'Devolución de garantía',
                        createdById: userId,
                    }),
                );
            }

            const amount = dto.refundAmount !== undefined ? new Decimal(dto.refundAmount) : suggested;
            if (amount.lte(0)) {
                throw new BadRequestException('La garantía sugerida es 0: indica refundAmount');
            }

            // Control: nunca devolver más garantía de la que tenemos retenida
            const balance = await this.liabilityBalance(manager);
            if (amount.gt(balance)) {
                throw new ConflictException(
                    `Solo hay ${balance.toFixed(2)} Bs de garantías retenidas; no se pueden devolver ${amount.toFixed(2)}`,
                );
            }

            const ledger = await manager.save(
                manager.create(DepositLedger, {
                    type: DepositEntryType.REFUNDED,
                    amount: amount.toNumber(),
                    containers: totalContainers,
                    saleId: null,
                    notes: dto.notes ?? null,
                }),
            );
            await manager.save(movements);
            await manager.save(
                manager.create(CashMovement, {
                    account: CashAccount.CASH,
                    type: CashMovementType.DEPOSIT_REFUND,
                    amount: amount.neg().toNumber(), // sale plata de caja
                    refType: 'deposit_refund',
                    refId: ledger.id,
                    createdById: userId,
                }),
            );

            return {
                refunded: amount.toNumber(),
                containers: totalContainers,
                liabilityAfter: balance.minus(amount).toNumber(),
            };
        });
    }

    // ───────── Resumen ─────────
    async summary() {
        const [{ balance }] = await this.dataSource.query(
            `SELECT COALESCE(SUM(CASE type WHEN 'CHARGED' THEN amount ELSE -amount END), 0) AS balance
       FROM deposit_ledger`,
        );
        const rows: { id: string; name: string; empties: string }[] = await this.dataSource.query(
            `SELECT ct.id, ct.name, COALESCE(SUM(cm.quantity), 0) AS empties
       FROM container_types ct
       LEFT JOIN container_movements cm ON cm.container_type_id = ct.id
       GROUP BY ct.id ORDER BY ct.name`,
        );
        return {
            liabilityBalance: round2(Number(balance)), // garantías por devolver (pasivo)
            emptiesInStore: rows.map((r) => ({ containerTypeId: r.id, name: r.name, empties: Number(r.empties) })),
        };
    }

    private async liabilityBalance(manager: EntityManager): Promise<Decimal> {
        const [row] = await manager.query(
            `SELECT COALESCE(SUM(CASE type WHEN 'CHARGED' THEN amount ELSE -amount END), 0) AS balance
       FROM deposit_ledger`,
        );
        return new Decimal(row.balance);
    }

    private async assertNameFree(name: string, excludeId?: string) {
        const qb = this.types.createQueryBuilder('t').where('LOWER(t.name) = LOWER(:name)', { name });
        if (excludeId) qb.andWhere('t.id != :excludeId', { excludeId });
        if (await qb.getExists()) throw new ConflictException(`Ya existe el envase "${name}"`);
    }
}