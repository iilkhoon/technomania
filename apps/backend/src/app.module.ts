import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { AiModule } from './ai/ai.module';
import { PosModule } from './pos/pos.module';
import { CreditModule } from './credit/credit.module';
import { InventoryModule } from './inventory/inventory.module';
import { BossModule } from './boss/boss.module';
import { CatalogModule } from './catalog/catalog.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    RedisModule,
    AiModule,
    PosModule,
    CreditModule,
    InventoryModule,
    BossModule,
    CatalogModule,
    SearchModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
