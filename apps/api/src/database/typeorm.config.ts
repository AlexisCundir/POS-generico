import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { User } from '../modules/users/entities/user.entity.js';
import { Product } from '../modules/catalog/entities/product.entity.js';
import { ProductVariant } from '../modules/catalog/entities/product-variant.entity.js';
import { Presentation } from '../modules/catalog/entities/presentation.entity.js';
import { Purchase } from '../modules/purchasing/entities/purchase.entity.js';
import { StockLot } from '../modules/inventory/entities/stock-lot.entity.js';

/** Cada entidad nueva que crees debe agregarse a esta lista. */
export const entities = [
    User,
    Product,
    ProductVariant,
    Presentation,
    Purchase,
    StockLot,
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