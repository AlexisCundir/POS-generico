import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { PurchasingService } from './purchasing.service.js';
import { PurchaseCreateSchema } from './schemas/purchase.schemas.js';
import type { PurchaseCreate } from './schemas/purchase.schemas.js';

@Controller('purchasing/purchases')
export class PurchasingController {
    constructor(
        private readonly purchasing: PurchasingService,
        private readonly config: ConfigService,
    ) { }

    /** TEMPORAL: el Paso 7 lo reemplaza por el usuario autenticado */
    private devUserId(): string {
        return this.config.getOrThrow<string>('DEV_USER_ID');
    }

    @Post()
    create(@Body(new ZodValidationPipe(PurchaseCreateSchema)) dto: PurchaseCreate) {
        return this.purchasing.create(dto, this.devUserId());
    }

    @Get()
    findAll() {
        return this.purchasing.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.purchasing.findOne(id);
    }
}