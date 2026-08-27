import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';
import { SearchModule } from '../search/search.module';
import { ImageOptimizerService } from '../common/services/image-optimizer.service';
import { WebpConversionInterceptor } from '../common/interceptors/webp-conversion.interceptor';

@Module({
  imports: [DatabaseModule, RedisModule, SearchModule],
  controllers: [CatalogController],
  providers: [CatalogService, ImageOptimizerService, WebpConversionInterceptor],
  exports: [CatalogService, ImageOptimizerService, WebpConversionInterceptor],
})
export class CatalogModule {}

