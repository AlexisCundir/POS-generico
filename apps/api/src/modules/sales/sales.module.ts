import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity.js';
import { SalesController } from './sales.controller.js';
import { SalesService } from './sales.service.js';

@Module({
    imports: [TypeOrmModule.forFeature([Sale])],
    controllers: [SalesController],
    providers: [SalesService],
})
export class SalesModule { }