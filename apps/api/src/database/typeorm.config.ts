import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { User } from '../modules/users/entities/user.entity.js';
import { Product } from '../modules/catalog/entities/product.entity.js';
import { ProductVariant } from '../modules/catalog/entities/product-variant.entity.js';
import { Presentation } from '../modules/catalog/entities/presentation.entity.js';
import { Purchase } from '../modules/purchasing/entities/purchase.entity.js';
import { StockLot } from '../modules/inventory/entities/stock-lot.entity.js';
import { StockAdjustment } from '../modules/inventory/entities/stock-adjustment.entity.js';
import { Sale } from '../modules/sales/entities/sale.entity.js';
import { SaleItem } from '../modules/sales/entities/sale-item.entity.js';
import { SaleItemLot } from '../modules/sales/entities/sale-item-lot.entity.js';
import { DepositLedger } from '../modules/deposits/entities/deposit-ledger.entity.js';
import { ContainerMovement } from '../modules/deposits/entities/container-movement.entity.js';
import { Expense } from '../modules/expenses/entities/expense.entity.js';
import { CashMovement } from '../modules/cash/entities/cash-movement.entity.js';
import { DailyCashClose } from '../modules/cash/entities/daily-cash-close.entity.js';

/** Cada entidad nueva que crees debe agregarse a esta lista. */
export const entities = [
    User,
    Product,
    ProductVariant,
    Presentation,
    Purchase,
    StockLot,
    StockAdjustment,
    Sale,
    SaleItem,
    SaleItemLot,
    DepositLedger,
    ContainerMovement,
    Expense,
    CashMovement,
    DailyCashClose,
];

export const buildTypeOrmOptions = (url: string) => ({
    type: 'postgres' as const,
    url,
    ssl: { rejectUnauthorized: false },
    entities,
    // Ruta relativa a apps/api (donde ejecutas los comandos). Usa "/" aunque estés en Windows.
    migrations: ['dist/database/migrations/*.js'],
    namingStrategy: new SnakeNamingStrategy(),
    uuidExtension: 'pgcrypto' as const,
    synchronize: false,
    logging: ['error', 'warn'] as ('error' | 'warn')[],
});