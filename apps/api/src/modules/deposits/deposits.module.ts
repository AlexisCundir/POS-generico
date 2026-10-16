import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepositsController } from './deposits.controller.js';
import { DepositsService } from './deposits.service.js';
import { ContainerType } from './entities/container-type.entity.js';

@Module({
    imports: [TypeOrmModule.forFeature([ContainerType])],
    controllers: [DepositsController],
    providers: [DepositsService],
})
export class DepositsModule { }