import {
    BadRequestException, ConflictException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity.js';
import { Presentation } from './entities/presentation.entity.js';
import type {
    PresentationUpdate, ProductCreate, ProductUpdate,
} from './schemas/product.schemas.js';

@Injectable()
export class CatalogService {
    constructor(
        @InjectRepository(Product) private readonly products: Repository<Product>,
        @InjectRepository(Presentation) private readonly presentations: Repository<Presentation>,
    ) { }

    async create(dto: ProductCreate): Promise<Product> {
        await this.assertNameFree(dto.name);

        // Producto sin sabores => una única variante "Estándar"
        const variants = dto.variants.length > 0 ? dto.variants : [{ flavor: 'Estándar' }];

        const product = this.products.create({
            name: dto.name,
            brand: dto.brand ?? null,
            category: dto.category,
            baseUnitName: dto.baseUnitName,
            hasFlavors: dto.hasFlavors,
            isReturnable: dto.isReturnable,
            depositPerUnit: dto.depositPerUnit,
            lowStockThreshold: dto.lowStockThreshold,
            variants: variants.map((v) => ({
                flavor: v.flavor,
                sku: 'sku' in v ? (v.sku ?? null) : null,
            })),
            presentations: dto.presentations.map((p) => ({
                name: p.name,
                baseUnitsQty: p.baseUnitsQty,
                suggestedPrice: p.suggestedPrice ?? null,
                isSellable: p.isSellable,
                isPurchasable: p.isPurchasable,
            })),
        });

        // cascade: true => guarda producto, variantes y presentaciones en UNA transacción
        return this.products.save(product);
    }

    findAll(): Promise<Product[]> {
        return this.products.find({
            relations: { variants: true, presentations: true },
            order: { name: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.products.findOne({
            where: { id },
            relations: { variants: true, presentations: true },
        });
        if (!product) throw new NotFoundException('Producto no encontrado');
        return product;
    }

    async update(id: string, dto: ProductUpdate): Promise<Product> {
        await this.findOne(id); // lanza 404 si no existe
        if (dto.name) await this.assertNameFree(dto.name, id);
        await this.products.update(id, dto);
        return this.findOne(id);
    }

    async updatePresentation(id: string, dto: PresentationUpdate): Promise<Presentation> {
        const presentation = await this.presentations.findOne({ where: { id } });
        if (!presentation) throw new NotFoundException('Presentación no encontrada');
        if (dto.suggestedPrice !== undefined && !presentation.isSellable) {
            throw new BadRequestException('Esta presentación no es vendible: no lleva precio sugerido');
        }
        Object.assign(presentation, dto);
        return this.presentations.save(presentation);
    }

    /** Evita productos duplicados sin importar mayúsculas (opcionalmente excluye uno, para renombrar) */
    private async assertNameFree(name: string, excludeId?: string) {
        const qb = this.products
            .createQueryBuilder('p')
            .where('LOWER(p.name) = LOWER(:name)', { name });
        if (excludeId) qb.andWhere('p.id != :excludeId', { excludeId });
        if (await qb.getExists()) {
            throw new ConflictException(`Ya existe un producto llamado "${name}"`);
        }
    }
}