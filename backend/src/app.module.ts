import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';

@Module({
  imports: [
    PrismaModule,
    PurchaseOrdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}