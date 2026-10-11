export enum UserRole {
    OWNER = 'OWNER',
    SELLER = 'SELLER',
}

export enum ProductCategory {
    LICOR = 'LICOR',
    CERVEZA = 'CERVEZA',
    CIGARRILLO = 'CIGARRILLO',
    BEBIDA_ENERGIZANTE = 'BEBIDA_ENERGIZANTE',
    SNACK = 'SNACK',
    OTRO = 'OTRO',
}

export enum PaymentMethod {
    CASH = 'CASH',
    QR = 'QR',
    TRANSFER = 'TRANSFER',
}

export enum SaleStatus {
    COMPLETED = 'COMPLETED',
    VOIDED = 'VOIDED',
}

export enum ExpenseType {
    HORMIGA = 'HORMIGA',
    FIJO = 'FIJO',
    FINANCIERO = 'FINANCIERO',
}

export enum DepositEntryType {
    CHARGED = 'CHARGED',
    REFUNDED = 'REFUNDED',
}

/** Mejora: separar efectivo en mano de saldo en banco (QR/transferencias). */
export enum CashAccount {
    CASH = 'CASH',
    BANK = 'BANK',
}

export enum CashMovementType {
    SALE = 'SALE',
    DEPOSIT_IN = 'DEPOSIT_IN',
    DEPOSIT_REFUND = 'DEPOSIT_REFUND',
    PURCHASE = 'PURCHASE',
    EXPENSE = 'EXPENSE',
    LOAN_PRINCIPAL = 'LOAN_PRINCIPAL', // capital de la cuota del banco (no es gasto)
    OWNER_CONTRIBUTION = 'OWNER_CONTRIBUTION',
    OWNER_WITHDRAWAL = 'OWNER_WITHDRAWAL',
    TRANSFER_BETWEEN_ACCOUNTS = 'TRANSFER_BETWEEN_ACCOUNTS',
    ADJUSTMENT = 'ADJUSTMENT',
}

export enum ContainerMovementType {
    CUSTOMER_RETURN = 'CUSTOMER_RETURN', // cliente trae un vacío (+)
    SUPPLIER_RETURN = 'SUPPLIER_RETURN', // devuelves vacíos al proveedor (-)
    BREAKAGE = 'BREAKAGE',               // se rompió un envase (-)
    ADJUSTMENT = 'ADJUSTMENT',           // corrección de conteo (+/-)
}

export enum StockAdjustmentReason {
    BREAKAGE = 'BREAKAGE',                 // rotura
    EXPIRED = 'EXPIRED',                   // vencido
    OWN_CONSUMPTION = 'OWN_CONSUMPTION',   // consumo propio / familia
    LOSS = 'LOSS',                         // pérdida o robo
    COUNT_CORRECTION = 'COUNT_CORRECTION', // el conteo físico dio menos
}