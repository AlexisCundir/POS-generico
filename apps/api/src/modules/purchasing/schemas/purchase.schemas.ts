import { z } from 'zod';
import { CashAccount } from '../../../common/enums.js';
import { positiveMoney } from '../../../common/schemas/primitives.js';

const cashAccountEnum = z.enum(Object.values(CashAccount) as [CashAccount, ...CashAccount[]]);

export const PurchaseLineSchema = z.object({
    variantId: z.uuid(),
    presentationId: z.uuid(), // la presentación COMPRABLE: 'Fajo x10', 'Paquete x12'
    packages: z.number().positive().max(100000),
    lineTotal: positiveMoney, // TOTAL pagado por esta línea (lo que dice el ticket)
});

export const PurchaseCreateSchema = z.object({
    supplierName: z.string().trim().min(1).max(80).optional(),
    purchasedAt: z.iso
        .datetime({ offset: true })
        .refine(
            (d) => new Date(d).getTime() <= Date.now() + 5 * 60 * 1000,
            'La fecha no puede estar en el futuro',
        )
        .optional(),
    paidFromAccount: cashAccountEnum.default(CashAccount.CASH),
    notes: z.string().trim().min(1).max(300).optional(),
    lines: z.array(PurchaseLineSchema).min(1, 'Agrega al menos una línea').max(50),
});

export type PurchaseCreate = z.output<typeof PurchaseCreateSchema>;