import { z } from 'zod';
import { ProductCategory } from '../../../common/enums.js';

const money = z
    .number()
    .min(0, 'No puede ser negativo')
    .multipleOf(0.01, 'Máximo 2 decimales');
const positiveMoney = money.refine((n) => n > 0, 'Debe ser mayor a 0');

const categoryEnum = z.enum(
    Object.values(ProductCategory) as [ProductCategory, ...ProductCategory[]],
);

// ───────────── Presentación ─────────────
export const PresentationSchema = z
    .object({
        name: z.string().trim().min(1, 'Nombre requerido').max(40),
        baseUnitsQty: z.number().positive().max(100000),
        isSellable: z.boolean().default(true),
        isPurchasable: z.boolean().default(false),
        suggestedPrice: positiveMoney.nullable().optional(),
    })
    .superRefine((p, ctx) => {
        if (p.isSellable && !p.suggestedPrice) {
            ctx.addIssue({
                code: 'custom',
                path: ['suggestedPrice'],
                message: 'Una presentación vendible necesita precio sugerido',
            });
        }
        if (!p.isSellable && !p.isPurchasable) {
            ctx.addIssue({
                code: 'custom',
                path: ['isSellable'],
                message: 'Debe ser vendible o comprable',
            });
        }
    });

// ───────────── Variante (sabor) ─────────────
export const VariantSchema = z.object({
    flavor: z.string().trim().min(1).max(40),
    sku: z.string().trim().min(1).max(40).optional(),
});

// ───────────── Crear producto ─────────────
export const ProductCreateSchema = z
    .object({
        name: z.string().trim().min(2).max(80),
        brand: z.string().trim().min(1).max(60).optional(),
        category: categoryEnum,
        baseUnitName: z.string().trim().min(1).default('unidad'),
        hasFlavors: z.boolean().default(false),
        isReturnable: z.boolean().default(false),
        depositPerUnit: money.default(0),
        lowStockThreshold: z.number().min(0).default(0),
        variants: z.array(VariantSchema).default([]),
        presentations: z.array(PresentationSchema).min(1, 'Agrega al menos una presentación'),
    })
    .superRefine((p, ctx) => {
        const bases = p.presentations.filter((x) => x.baseUnitsQty === 1);
        if (bases.length !== 1) {
            ctx.addIssue({
                code: 'custom',
                path: ['presentations'],
                message: 'Debe existir exactamente una presentación con 1 unidad base',
            });
        }
        if (!p.presentations.some((x) => x.isSellable)) {
            ctx.addIssue({
                code: 'custom',
                path: ['presentations'],
                message: 'Al menos una presentación debe ser vendible',
            });
        }
        const names = p.presentations.map((x) => x.name.toLowerCase());
        if (new Set(names).size !== names.length) {
            ctx.addIssue({
                code: 'custom',
                path: ['presentations'],
                message: 'Nombres de presentación duplicados',
            });
        }

        if (p.hasFlavors && p.variants.length === 0) {
            ctx.addIssue({ code: 'custom', path: ['variants'], message: 'Agrega al menos un sabor' });
        }
        if (!p.hasFlavors && p.variants.length > 0) {
            ctx.addIssue({
                code: 'custom',
                path: ['variants'],
                message: 'Sin sabores no se envían variantes (se crea "Estándar" automáticamente)',
            });
        }
        const flavors = p.variants.map((v) => v.flavor.toLowerCase());
        if (new Set(flavors).size !== flavors.length) {
            ctx.addIssue({ code: 'custom', path: ['variants'], message: 'Sabores duplicados' });
        }

        if (p.isReturnable && p.depositPerUnit <= 0) {
            ctx.addIssue({
                code: 'custom',
                path: ['depositPerUnit'],
                message: 'Define el monto de la garantía',
            });
        }
        if (!p.isReturnable && p.depositPerUnit > 0) {
            ctx.addIssue({
                code: 'custom',
                path: ['depositPerUnit'],
                message: 'Solo los retornables llevan garantía',
            });
        }
    });

// ───────────── Editar producto (solo datos básicos) ─────────────
export const ProductUpdateSchema = z
    .object({
        name: z.string().trim().min(2).max(80),
        brand: z.string().trim().min(1).max(60).nullable(),
        category: categoryEnum,
        lowStockThreshold: z.number().min(0),
        active: z.boolean(),
    })
    .partial()
    .strict()
    .refine((o) => Object.keys(o).length > 0, 'Envía al menos un campo');

// ───────────── Editar presentación (precio / activa) ─────────────
export const PresentationUpdateSchema = z
    .object({
        suggestedPrice: positiveMoney,
        active: z.boolean(),
    })
    .partial()
    .strict()
    .refine((o) => Object.keys(o).length > 0, 'Envía al menos un campo');

export type ProductCreate = z.output<typeof ProductCreateSchema>;
export type ProductUpdate = z.output<typeof ProductUpdateSchema>;
export type PresentationUpdate = z.output<typeof PresentationUpdateSchema>;
export type VariantCreate = z.output<typeof VariantSchema>;