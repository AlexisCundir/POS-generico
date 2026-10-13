import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from './entities/purchase.entity.js';
import { PurchasingController } from './purchasing.controller.js';
import { PurchasingService } from './purchasing.service.js';

@Module({
    imports: [TypeOrmModule.forFeature([Purchase])],
    controllers: [PurchasingController],
    providers: [PurchasingService],
})
export class PurchasingModule { }