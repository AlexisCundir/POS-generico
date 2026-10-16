import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { DepositsService } from './deposits.service.js';
import {
    ContainerTypeCreateSchema, ContainerTypeUpdateSchema, RefundCreateSchema,
} from './schemas/deposit.schemas.js';
import type {
    ContainerTypeCreate, ContainerTypeUpdate, RefundCreate,
} from './schemas/deposit.schemas.js';

@Controller('deposits')
export class DepositsController {
    constructor(
        private readonly deposits: DepositsService,
        private readonly config: ConfigService,
    ) { }

    /** TEMPORAL: el login lo reemplazará */
    private devUserId(): string {
        return this.config.getOrThrow<string>('DEV_USER_ID');
    }

    @Post('container-types')
    createType(@Body(new ZodValidationPipe(ContainerTypeCreateSchema)) dto: ContainerTypeCreate) {
        return this.deposits.createType(dto);
    }

    @Get('container-types')
    findTypes() {
        return this.deposits.findTypes();
    }

    @Patch('container-types/:id')
    updateType(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(new ZodValidationPipe(ContainerTypeUpdateSchema)) dto: ContainerTypeUpdate,
    ) {
        return this.deposits.updateType(id, dto);
    }

    @Post('refunds')
    refund(@Body(new ZodValidationPipe(RefundCreateSchema)) dto: RefundCreate) {
        return this.deposits.refund(dto, this.devUserId());
    }

    @Get('summary')
    summary() {
        return this.deposits.summary();
    }
}