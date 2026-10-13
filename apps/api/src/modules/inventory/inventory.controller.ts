import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { InventoryService } from './inventory.service.js';

@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventory: InventoryService) { }

    @Get('stock')
    getStock() {
        return this.inventory.getStock();
    }

    @Get('lots/:variantId')
    getLots(@Param('variantId', ParseUUIDPipe) variantId: string) {
        return this.inventory.getLots(variantId);
    }
}