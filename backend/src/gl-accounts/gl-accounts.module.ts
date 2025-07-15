import { Module } from '@nestjs/common';
import { GLAccountsService } from './gl-accounts.service';
import { GLAccountsController } from './gl-accounts.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GLAccountsController],
  providers: [GLAccountsService],
  exports: [GLAccountsService],
})
export class GLAccountsModule {} 