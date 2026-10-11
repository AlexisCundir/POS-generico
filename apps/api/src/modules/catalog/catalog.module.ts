import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogController } from './catalog.controller.js';
import { CatalogService } from './catalog.service.js';
import { Product } from './entities/product.entity.js';
import { ProductVariant } from './entities/product-variant.entity.js';
import { Presentation } from './entities/presentation.entity.js';

@Module({
    imports: [TypeOrmModule.forFeature([Product, ProductVariant, Presentation])],
    controllers: [CatalogController],
    providers: [CatalogService],
    exports: [CatalogService], // lo usarán Compras y Ventas
})
export class CatalogModule { }