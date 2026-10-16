import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { SalesService } from './sales.service.js';
import { SaleCreateSchema } from './schemas/sale.schemas.js';
import type { SaleCreate } from './schemas/sale.schemas.js';

@Controller('sales')
export class SalesController {
    constructor(
        private readonly sales: SalesService,
        private readonly config: ConfigService,
    ) { }

    /** TEMPORAL: el login reemplazará esto por el usuario autenticado */
    private devUserId(): string {
        return this.config.getOrThrow<string>('DEV_USER_ID');
    }

    @Post()
    create(@Body(new ZodValidationPipe(SaleCreateSchema)) dto: SaleCreate) {
        return this.sales.create(dto, this.devUserId());
    }

    @Get()
    findAll() {
        return this.sales.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.sales.findOne(id);
    }
}