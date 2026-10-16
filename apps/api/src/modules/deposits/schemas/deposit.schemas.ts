import { z } from 'zod';
import { money, positiveMoney } from '../../../common/schemas/primitives.js';

export const ContainerTypeCreateSchema = z.object({
    name: z.string().trim().min(2).max(40),
    depositAmount: money, // garantía por pieza
});

export const ContainerTypeUpdateSchema = z
    .object({
        name: z.string().trim().min(2).max(40),
        depositAmount: money,
        active: z.boolean(),
    })
    .partial()
    .strict()
    .refine((o) => Object.keys(o).length > 0, 'Envía al menos un campo');

export const RefundCreateSchema = z
    .object({
        items: z
            .array(
                z.object({
                    containerTypeId: z.uuid(),
                    quantity: z.number().int().positive().max(5000),
                }),
            )
            .min(1)
            .max(10),
        /** Si se omite, se devuelve la garantía sugerida (suma por pieza) */
        refundAmount: positiveMoney.optional(),
        notes: z.string().trim().min(1).max(200).optional(),
    })
    .superRefine((r, ctx) => {
        const ids = r.items.map((i) => i.containerTypeId);
        if (new Set(ids).size !== ids.length) {
            ctx.addIssue({ code: 'custom', path: ['items'], message: 'Tipo de envase repetido' });
        }
    });

export type ContainerTypeCreate = z.output<typeof ContainerTypeCreateSchema>;
export type ContainerTypeUpdate = z.output<typeof ContainerTypeUpdateSchema>;
export type RefundCreate = z.output<typeof RefundCreateSchema>;