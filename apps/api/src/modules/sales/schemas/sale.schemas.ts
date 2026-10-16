import { z } from 'zod';
import { PaymentMethod } from '../../../common/enums.js';
import { money, positiveMoney } from '../../../common/schemas/primitives.js';

const paymentMethodEnum = z.enum(
    Object.values(PaymentMethod) as [PaymentMethod, ...PaymentMethod[]],
);

export const SaleLineSchema = z.object({
    variantId: z.uuid(),
    presentationId: z.uuid(),
    quantity: z.number().int().positive().max(1000),
    agreedUnitPrice: positiveMoney, // precio PACTADO
}).strict();

export const ReturnedContainerSchema = z.object({
    containerTypeId: z.uuid(),
    quantity: z.number().int().positive().max(5000),
}).strict();

export const SaleCreateSchema = z
    .object({
        clientSaleId: z.uuid(),
        paymentMethod: paymentMethodEnum.default(PaymentMethod.CASH),
        notes: z.string().trim().min(1).max(300).optional(),
        /** Envases vacíos que el cliente trae a cambio (de toda la venta) */
        returnedContainers: z.array(ReturnedContainerSchema).max(10).default([]),
        /** Garantía total que se cobra. Si se omite, se cobra la sugerida. Puede ser 0. */
        depositCharged: money.optional(),
        lines: z.array(SaleLineSchema).min(1, 'Carrito vacío').max(50),
    }).strict()
    .superRefine((s, ctx) => {
        const ids = s.returnedContainers.map((r) => r.containerTypeId);
        if (new Set(ids).size !== ids.length) {
            ctx.addIssue({ code: 'custom', path: ['returnedContainers'], message: 'Tipo de envase repetido' });
        }
    });

export type SaleCreate = z.output<typeof SaleCreateSchema>;