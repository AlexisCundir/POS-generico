import { ValueTransformer } from 'typeorm';

export const numericTransformer: ValueTransformer = {
    to: (value?: number | null) => value,
    from: (value?: string | null) =>
        value === null || value === undefined ? null : parseFloat(value),
};

/** Dinero en BOB: 2 decimales */
export const money = {
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
} as const;

/** Cantidades en unidades base (admiten fracciones) */
export const qty = {
    type: 'numeric',
    precision: 14,
    scale: 4,
    transformer: numericTransformer,
} as const;

/** Costo por unidad base: 6 decimales para no perder precisión (ej. 100/3) */
export const unitCostCol = {
    type: 'numeric',
    precision: 14,
    scale: 6,
    transformer: numericTransformer,
} as const;