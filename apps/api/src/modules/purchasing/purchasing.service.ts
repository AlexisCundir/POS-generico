import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Decimal } from 'decimal.js';
import { CashMovementType } from '../../common/enums.js';
import { CashMovement } from '../cash/entities/cash-movement.entity.js';
import { Presentation } from '../catalog/entities/presentation.entity.js';
import { ProductVariant } from '../catalog/entities/product-variant.entity.js';
import { StockLot } from '../inventory/entities/stock-lot.entity.js';
import { Purchase } from './entities/purchase.entity.js';
import type { PurchaseCreate } from './schemas/purchase.schemas.js';

@Injectable()
export class PurchasingService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(Purchase) private readonly purchases: Repository<Purchase>,
    ) { }

    async create(dto: PurchaseCreate, userId: string): Promise<Purchase> {
        const purchasedAt = dto.purchasedAt ? new Date(dto.purchasedAt) : new Date();

        // Todo lo que está dentro de transaction() se confirma junto o se deshace junto.
        // IMPORTANTE: dentro usamos siempre "manager", nunca los repositorios inyectados:
        // solo "manager" comparte la conexión de la transacción.
        return this.dataSource.transaction(async (manager) => {
            // ───── FASE 1: validar y calcular (no se escribe nada todavía) ─────
            const lots: StockLot[] = [];
            let total = new Decimal(0);

            for (const [i, line] of dto.lines.entries()) {
                const where = `Línea ${i + 1}`;

                const variant = await manager.findOne(ProductVariant, {
                    where: { id: line.variantId },
                });
                if (!variant) throw new NotFoundException(`${where}: la variante no existe`);
                if (!variant.active) {
                    throw new BadRequestException(`${where}: la variante está desactivada`);
                }

                const presentation = await manager.findOne(Presentation, {
                    where: { id: line.presentationId },
                });
                if (!presentation) throw new NotFoundException(`${where}: la presentación no existe`);
                if (presentation.productId !== variant.productId) {
                    throw new BadRequestException(
                        `${where}: la presentación no pertenece al producto de la variante`,
                    );
                }
                if (!presentation.isPurchasable || !presentation.active) {
                    throw new BadRequestException(
                        `${where}: la presentación "${presentation.name}" no es comprable`,
                    );
                }

                const initial = new Decimal(line.packages).mul(presentation.baseUnitsQty);
                const lineTotal = new Decimal(line.lineTotal);

                // Costo por unidad base = total pagado / unidades recibidas (350 / 36 = 9.722222)
                const unitCost = lineTotal.div(initial);
                // Costo por paquete: solo informativo, a 2 decimales
                const packageCost = lineTotal.div(line.packages).toDecimalPlaces(2);
                total = total.plus(lineTotal);

                lots.push(
                    manager.create(StockLot, {
                        variantId: variant.id,
                        purchasePresentationId: presentation.id,
                        packagesPurchased: line.packages,
                        packageCost: packageCost.toNumber(),
                        initialBaseUnits: initial.toNumber(),
                        remainingBaseUnits: initial.toNumber(),
                        unitCost: unitCost.toDecimalPlaces(6).toNumber(),
                        receivedAt: purchasedAt, // el FIFO ordena por esta fecha
                    }),
                );
            }

            // ───── FASE 2: guardar ─────
            const purchase = manager.create(Purchase, {
                supplierName: dto.supplierName ?? null,
                purchasedAt,
                totalCost: total.toNumber(),
                paidFromAccount: dto.paidFromAccount,
                notes: dto.notes ?? null,
                createdById: userId,
                lots, // cascade: se guardan junto con la compra
            });
            const saved = await manager.save(purchase);

            // La plata sale de la cuenta elegida (monto NEGATIVO)
            await manager.save(
                manager.create(CashMovement, {
                    account: dto.paidFromAccount,
                    type: CashMovementType.PURCHASE,
                    amount: total.neg().toNumber(),
                    occurredAt: purchasedAt,
                    refType: 'purchase',
                    refId: saved.id,
                    notes: dto.supplierName ? `Compra a ${dto.supplierName}` : 'Compra',
                    createdById: userId,
                }),
            );

            return saved;
        });
    }

    findAll(): Promise<Purchase[]> {
        return this.purchases.find({
            relations: { lots: { variant: { product: true } } },
            order: { purchasedAt: 'DESC' },
            take: 50,
        });
    }

    async findOne(id: string): Promise<Purchase> {
        const purchase = await this.purchases.findOne({
            where: { id },
            relations: { lots: { variant: { product: true }, purchasePresentation: true } },
        });
        if (!purchase) throw new NotFoundException('Compra no encontrada');
        return purchase;
    }
}