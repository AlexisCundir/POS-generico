import { z } from 'zod';
import { PaymentMethod } from '../../../common/enums.js';
import { positiveMoney } from '../../../common/schemas/primitives.js';

const paymentMethodEnum = z.enum(
    Object.values(PaymentMethod) as [PaymentMethod, ...PaymentMethod[]],
);

export const SaleLineSchema = z.object({
    variantId: z.uuid(),
    presentationId: z.uuid(),
    quantity: z.number().int().positive().max(1000), // en la presentación vendida
    agreedUnitPrice: positiveMoney, // precio PACTADO (puede diferir del sugerido)
    emptiesReturned: z.number().int().min(0).default(0), // envases vacíos que trae el cliente
});

export const SaleCreateSchema = z.object({
    clientSaleId: z.uuid(), // lo genera el celular (idempotencia)
    paymentMethod: paymentMethodEnum.default(PaymentMethod.CASH),
    notes: z.string().trim().min(1).max(300).optional(),
    lines: z.array(SaleLineSchema).min(1, 'Carrito vacío').max(50),
});

export type SaleCreate = z.output<typeof SaleCreateSchema>;