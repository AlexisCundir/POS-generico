import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Put } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import {
    PresentationUpdateSchema, ProductCreateSchema, ProductUpdateSchema, VariantSchema, PresentationContainersSchema,
} from './schemas/product.schemas.js';
import type {
    PresentationUpdate, ProductCreate, ProductUpdate, VariantCreate, PresentationContainersInput,
} from './schemas/product.schemas.js';

@Controller('catalog')
export class CatalogController {
    constructor(private readonly catalog: CatalogService) { }

    @Post('products')
    create(@Body(new ZodValidationPipe(ProductCreateSchema)) dto: ProductCreate) {
        return this.catalog.create(dto);
    }

    @Get('products')
    findAll() {
        return this.catalog.findAll();
    }

    @Get('products/:id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.catalog.findOne(id);
    }

    @Patch('products/:id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(new ZodValidationPipe(ProductUpdateSchema)) dto: ProductUpdate,
    ) {
        return this.catalog.update(id, dto);
    }

    // endpoint para agregar un sabor nuevo a un producto existente
    @Post('products/:id/variants')
    addVariant(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(new ZodValidationPipe(VariantSchema)) dto: VariantCreate,
    ) {
        return this.catalog.addVariant(id, dto);
    }

    @Patch('presentations/:id')
    updatePresentation(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(new ZodValidationPipe(PresentationUpdateSchema)) dto: PresentationUpdate,
    ) {
        return this.catalog.updatePresentation(id, dto);
    }

    @Put('presentations/:id/containers')
    setContainers(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(new ZodValidationPipe(PresentationContainersSchema)) dto: PresentationContainersInput,
    ) {
        return this.catalog.setPresentationContainers(id, dto);
    }

}