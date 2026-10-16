import {
    BadRequestException, ConflictException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import type { EntityManager } from 'typeorm';
import { Decimal } from 'decimal.js';
import {
    CashAccount, CashMovementType, ContainerMovementType, DepositEntryType, PaymentMethod,
} from '../../common/enums.js';
import { CashMovement } from '../cash/entities/cash-movement.entity.js';
import { Presentation } from '../catalog/entities/presentation.entity.js';
import { ProductVariant } from '../catalog/entities/product-variant.entity.js';
import { ContainerMovement } from '../deposits/entities/container-movement.entity.js';
import { DepositLedger } from '../deposits/entities/deposit-ledger.entity.js';
import { StockLot } from '../inventory/entities/stock-lot.entity.js';
import { SaleItemLot } from './entities/sale-item-lot.entity.js';
import { SaleItem } from './entities/sale-item.entity.js';
import { Sale } from './entities/sale.entity.js';
import type { SaleCreate } from './schemas/sale.schemas.js';

@Injectable()
export class SalesService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(Sale) private readonly sales: Repository<Sale>,
    ) { }

    async create(dto: SaleCreate, sellerId: string): Promise<Sale> {
        try {
            const saleId = await this.dataSource.transaction((manager) =>
                this.createInTransaction(manager, dto, sellerId),
            );
            return await this.findOne(saleId);
        } catch (error) {
            // Dos peticiones simultáneas con el mismo clientSaleId: la base rechaza la segunda
            // (clave única) y le devolvemos la venta que ya existe.
            if (this.isUniqueViolation(error)) {
                const existing = await this.sales.findOne({
                    where: { clientSaleId: dto.clientSaleId },
                    select: { id: true },
                });
                if (existing) return this.findOne(existing.id);
            }
            throw error;
        }
    }

    private async createInTransaction(
        manager: EntityManager,
        dto: SaleCreate,
        sellerId: string,
    ): Promise<string> {
        // Reintento del celular: si la venta ya existe, no se repite
        const duplicate = await manager.findOne(Sale, {
            where: { clientSaleId: dto.clientSaleId },
            select: { id: true },
        });
        if (duplicate) return duplicate.id;

        const account =
            dto.paymentMethod === PaymentMethod.CASH ? CashAccount.CASH : CashAccount.BANK;

        // Orden fijo por variante: evita deadlocks. Guardamos el índice original para los mensajes.
        const ordered = dto.lines
            .map((line, index) => ({ line, index }))
            .sort((a, b) => a.line.variantId.localeCompare(b.line.variantId));

        const items: SaleItem[] = [];
        const returns: { productId: string; quantity: number }[] = [];
        let unreturnedContainers = 0;

        for (const { line, index } of ordered) {
            const where = `Línea ${index + 1}`;

            const variant = await manager.findOne(ProductVariant, { where: { id: line.variantId } });
            if (!variant) throw new NotFoundException(`${where}: la variante no existe`);
            if (!variant.active) {
                throw new BadRequestException(`${where}: la variante está desactivada`);
            }

            const presentation = await manager.findOne(Presentation, {
                where: { id: line.presentationId },
                relations: { product: true },
            });
            if (!presentation) throw new NotFoundException(`${where}: la presentación no existe`);
            if (presentation.productId !== variant.productId) {
                throw new BadRequestException(
                    `${where}: la presentación no pertenece al producto de la variante`,
                );
            }
            if (!presentation.isSellable || !presentation.active) {
                throw new BadRequestException(`${where}: "${presentation.name}" no es vendible`);
            }

            const product = presentation.product;
            const baseUnits = new Decimal(line.quantity).mul(presentation.baseUnitsQty);

            // ── Envases: se paga garantía por cada envase llevado sin vacío a cambio ──
            const containersOut = product.isReturnable ? baseUnits : new Decimal(0);
            if (line.emptiesReturned > containersOut.toNumber()) {
                throw new BadRequestException(
                    product.isReturnable
                        ? `${where}: devuelve más envases (${line.emptiesReturned}) de los que se lleva (${containersOut})`
                        : `${where}: ${product.name} no usa envases retornables`,
                );
            }
            const unreturned = containersOut.minus(line.emptiesReturned);
            const depositCharged = unreturned.mul(product.depositPerUnit).toDecimalPlaces(2);

            // ── FIFO: consumir lotes, del más antiguo al más nuevo ──
            const consumptions = await this.consumeFifo(
                manager,
                variant.id,
                baseUnits,
                `${where}: stock insuficiente de ${product.name} (${variant.flavor})`,
            );

            const lineTotal = new Decimal(line.quantity).mul(line.agreedUnitPrice).toDecimalPlaces(2);
            const costTotal = consumptions.reduce(
                (sum, c) => sum.plus(c.costSubtotal),
                new Decimal(0),
            );

            items.push(
                manager.create(SaleItem, {
                    variantId: variant.id,
                    presentationId: presentation.id,
                    quantity: line.quantity,
                    baseUnitsConsumed: baseUnits.toNumber(),
                    suggestedUnitPrice: presentation.suggestedPrice ?? 0, // snapshot
                    agreedUnitPrice: line.agreedUnitPrice, // precio pactado
                    lineTotal: lineTotal.toNumber(),
                    costTotal: costTotal.toNumber(),
                    grossProfit: lineTotal.minus(costTotal).toNumber(), // puede ser negativo
                    emptiesReturned: line.emptiesReturned,
                    depositCharged: depositCharged.toNumber(),
                    consumptions,
                }),
            );

            if (line.emptiesReturned > 0) {
                returns.push({ productId: product.id, quantity: line.emptiesReturned });
            }
            unreturnedContainers += unreturned.toNumber();
        }

        // ── Totales de la venta (los calcula el servidor) ──
        const sum = (pick: (i: SaleItem) => number) =>
            items.reduce((acc, i) => acc.plus(pick(i)), new Decimal(0));
        const itemsTotal = sum((i) => i.lineTotal);
        const depositTotal = sum((i) => i.depositCharged);
        const totalCost = sum((i) => i.costTotal);

        const sale = await manager.save(
            manager.create(Sale, {
                clientSaleId: dto.clientSaleId,
                sellerId,
                paymentMethod: dto.paymentMethod,
                itemsTotal: itemsTotal.toNumber(),
                depositTotal: depositTotal.toNumber(),
                total: itemsTotal.plus(depositTotal).toNumber(),
                totalCost: totalCost.toNumber(),
                grossProfit: itemsTotal.minus(totalCost).toNumber(),
                notes: dto.notes ?? null,
                items, // cascade: guarda líneas y lotes consumidos
            }),
        );

        // ── Caja ──
        await manager.save(
            manager.create(CashMovement, {
                account,
                type: CashMovementType.SALE,
                amount: itemsTotal.toNumber(),
                refType: 'sale',
                refId: sale.id,
                createdById: sellerId,
            }),
        );

        // ── Garantías: entran a caja pero son PASIVO (plata del cliente), no ingreso ──
        if (depositTotal.gt(0)) {
            await manager.save(
                manager.create(CashMovement, {
                    account,
                    type: CashMovementType.DEPOSIT_IN,
                    amount: depositTotal.toNumber(),
                    refType: 'sale',
                    refId: sale.id,
                    notes: 'Garantía de envases',
                    createdById: sellerId,
                }),
            );
            await manager.save(
                manager.create(DepositLedger, {
                    type: DepositEntryType.CHARGED,
                    amount: depositTotal.toNumber(),
                    containers: unreturnedContainers,
                    saleId: sale.id,
                }),
            );
        }

        // ── Envases vacíos que el cliente trajo: entran a nuestro stock de cascos ──
        for (const r of returns) {
            await manager.save(
                manager.create(ContainerMovement, {
                    productId: r.productId,
                    type: ContainerMovementType.CUSTOMER_RETURN,
                    quantity: r.quantity,
                    saleId: sale.id,
                    createdById: sellerId,
                }),
            );
        }

        return sale.id;
    }

    /** Consume `needed` unidades base desde los lotes más antiguos. Puede cruzar varios lotes. */
    private async consumeFifo(
        manager: EntityManager,
        variantId: string,
        needed: Decimal,
        errorLabel: string,
    ): Promise<SaleItemLot[]> {
        // pessimistic_write = SELECT ... FOR UPDATE: otras ventas esperan hasta que esta termine
        const lots = await manager
            .getRepository(StockLot)
            .createQueryBuilder('l')
            .setLock('pessimistic_write')
            .where('l.variantId = :variantId', { variantId })
            .andWhere('l.remainingBaseUnits > 0')
            .orderBy('l.receivedAt', 'ASC')
            .addOrderBy('l.id', 'ASC')
            .getMany();

        let pending = needed;
        const result: SaleItemLot[] = [];

        for (const lot of lots) {
            if (pending.lte(0)) break;
            const take = Decimal.min(pending, lot.remainingBaseUnits);

            lot.remainingBaseUnits = new Decimal(lot.remainingBaseUnits).minus(take).toNumber();
            await manager.save(lot);

            result.push(
                manager.create(SaleItemLot, {
                    lotId: lot.id,
                    baseUnits: take.toNumber(),
                    unitCost: lot.unitCost, // snapshot del costo del lote
                    costSubtotal: take.mul(lot.unitCost).toDecimalPlaces(2).toNumber(),
                }),
            );
            pending = pending.minus(take);
        }

        if (pending.gt(0)) {
            throw new ConflictException(`${errorLabel}: faltan ${pending.toString()} unidades`);
        }
        return result;
    }

    findAll(): Promise<Sale[]> {
        return this.sales.find({
            relations: { items: { variant: { product: true }, presentation: true } },
            order: { soldAt: 'DESC' },
            take: 50,
        });
    }

    async findOne(id: string): Promise<Sale> {
        const sale = await this.sales.findOne({
            where: { id },
            relations: {
                items: { variant: { product: true }, presentation: true, consumptions: true },
            },
        });
        if (!sale) throw new NotFoundException('Venta no encontrada');
        return sale;
    }

    private isUniqueViolation(error: unknown): boolean {
        return (
            error instanceof QueryFailedError &&
            (error.driverError as { code?: string } | undefined)?.code === '23505'
        );
    }
}