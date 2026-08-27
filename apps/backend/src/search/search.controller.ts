import { Controller, Get, Post, Query, Header, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { AdminApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async search(
    @Query('q') q?: string,
    @Query('category_id') categoryId?: string,
    @Query('brand') brand?: string,
    @Query('min_price') minPrice?: string,
    @Query('max_price') maxPrice?: string,
    @Query('sort') sort?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.searchService.search({
      query: q || '',
      category_id: categoryId,
      brand,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sort,
      limit: limit ? parseInt(limit, 10) : 20,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  @Get('suggest')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async suggest(@Query('q') q?: string, @Query('limit') limit?: string) {
    return this.searchService.suggest(q || '', limit ? parseInt(limit, 10) : 5);
  }

  @Post('sync')
  @UseGuards(AdminApiKeyGuard)
  async syncAll() {
    return this.searchService.syncAllProducts();
  }
}
