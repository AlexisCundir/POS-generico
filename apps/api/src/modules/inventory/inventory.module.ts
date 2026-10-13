import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariant } from '../catalog/entities/product-variant.entity.js';
import { InventoryController } from './inventory.controller.js';
import { InventoryService } from './inventory.service.js';
import { StockLot } from './entities/stock-lot.entity.js';

@Module({
    imports: [TypeOrmModule.forFeature([ProductVariant, StockLot])],
    controllers: [InventoryController],
    providers: [InventoryService],
    exports: [InventoryService], // lo usará Ventas
})
export class InventoryModule { }