
```
licoreria-pos
├─ apps
│  └─ api
│     ├─ .prettierrc
│     ├─ nest-cli.json
│     ├─ oxlint.json
│     ├─ package.json
│     ├─ README.md
│     ├─ src
│     │  ├─ app.controller.spec.ts
│     │  ├─ app.controller.ts
│     │  ├─ app.module.ts
│     │  ├─ app.service.ts
│     │  ├─ common
│     │  │  ├─ enums.ts
│     │  │  ├─ pipes
│     │  │  │  └─ zod-validation.pipe.ts
│     │  │  ├─ schemas
│     │  │  │  └─ primitives.ts
│     │  │  └─ transformers.ts
│     │  ├─ database
│     │  │  ├─ data-source.ts
│     │  │  ├─ migrations
│     │  │  │  ├─ 1791750569167-Init.ts
│     │  │  │  ├─ 1791752733060-AddSalesCashExpenses.ts
│     │  │  │  └─ 1792188686187-ContainerTypes.ts
│     │  │  └─ typeorm.config.ts
│     │  ├─ main.ts
│     │  └─ modules
│     │     ├─ cash
│     │     │  └─ entities
│     │     │     ├─ cash-movement.entity.ts
│     │     │     └─ daily-cash-close.entity.ts
│     │     ├─ catalog
│     │     │  ├─ catalog.controller.ts
│     │     │  ├─ catalog.module.ts
│     │     │  ├─ catalog.service.ts
│     │     │  ├─ entities
│     │     │  │  ├─ presentation-container.entity.ts
│     │     │  │  ├─ presentation.entity.ts
│     │     │  │  ├─ product-variant.entity.ts
│     │     │  │  └─ product.entity.ts
│     │     │  └─ schemas
│     │     │     └─ product.schemas.ts
│     │     ├─ deposits
│     │     │  ├─ deposits.controller.ts
│     │     │  ├─ deposits.module.ts
│     │     │  ├─ deposits.service.ts
│     │     │  ├─ entities
│     │     │  │  ├─ container-movement.entity.ts
│     │     │  │  ├─ container-type.entity.ts
│     │     │  │  └─ deposit-ledger.entity.ts
│     │     │  └─ schemas
│     │     │     └─ deposit.schemas.ts
│     │     ├─ expenses
│     │     │  └─ entities
│     │     │     └─ expense.entity.ts
│     │     ├─ inventory
│     │     │  ├─ entities
│     │     │  │  ├─ stock-adjustment.entity.ts
│     │     │  │  └─ stock-lot.entity.ts
│     │     │  ├─ inventory.controller.ts
│     │     │  ├─ inventory.module.ts
│     │     │  └─ inventory.service.ts
│     │     ├─ purchasing
│     │     │  ├─ entities
│     │     │  │  └─ purchase.entity.ts
│     │     │  ├─ purchasing.controller.ts
│     │     │  ├─ purchasing.module.ts
│     │     │  ├─ purchasing.service.ts
│     │     │  └─ schemas
│     │     │     └─ purchase.schemas.ts
│     │     ├─ sales
│     │     │  ├─ entities
│     │     │  │  ├─ sale-container.entity.ts
│     │     │  │  ├─ sale-item-lot.entity.ts
│     │     │  │  ├─ sale-item.entity.ts
│     │     │  │  └─ sale.entity.ts
│     │     │  ├─ sales.controller.ts
│     │     │  ├─ sales.module.ts
│     │     │  ├─ sales.service.ts
│     │     │  └─ schemas
│     │     │     └─ sale.schemas.ts
│     │     └─ users
│     │        └─ entities
│     │           └─ user.entity.ts
│     ├─ test
│     │  └─ app.e2e-spec.ts
│     ├─ tsconfig.build.json
│     ├─ tsconfig.build.tsbuildinfo
│     ├─ tsconfig.json
│     ├─ vitest.config.e2e.ts
│     └─ vitest.config.ts
├─ packages
├─ pnpm-lock.yaml
└─ pnpm-workspace.yaml

```