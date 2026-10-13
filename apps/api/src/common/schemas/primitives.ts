import { z } from 'zod';

/** Dinero en BOB: no negativo y máximo 2 decimales */
export const money = z
    .number()
    .min(0, 'No puede ser negativo')
    .multipleOf(0.01, 'Máximo 2 decimales');

export const positiveMoney = money.refine((n) => n > 0, 'Debe ser mayor a 0');