import { Controller, Post, Get, Body, Header, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AdminApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * Executive Command Center: Boss Natural Language AI Assistant
   */
  @Post('boss-query')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async askBossQuery(@Body() body: { question: string; history?: any[] }) {
    const question = body.question || 'TechnoMania-nın bugünkü əsas biznes göstəriciləri hansılardır?';
    const history = body.history || [];
    return this.aiService.askBossDashboard(question, history);
  }

  /**
   * Daily Executive Briefing (Morning KPI Briefing for Boss)
   */
  @Get('daily-briefing')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async getDailyBriefing() {
    return this.aiService.getDailyExecutiveBriefing();
  }

  /**
   * AI Product Content & SEO Generation for ERP Catalog
   */
  @Post('generate-product-content')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async generateProductContent(
    @Body() body: { title: string; category?: string; brand?: string; specs?: any }
  ) {
    return this.aiService.generateProductDetails(
      body.title || 'Məhsul',
      body.category || 'Elektronika',
      body.brand || 'TechnoMania',
      body.specs
    );
  }

  /**
   * AI Credit Approval Scoring
   */
  @Post('credit-score')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async scoreCredit(
    @Body() body: { income: number; months: number; price: number; pin: string }
  ) {
    return this.aiService.predictCreditApproval(
      body.income || 800,
      body.months || 12,
      body.price || 1200,
      body.pin || ''
    );
  }

  /**
   * Storefront & Mobile Virtual AI Support
   */
  @Post('chat-support')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async chatSupport(@Body() body: { message: string }) {
    return this.aiService.chatSupport(body.message || 'Salam');
  }
}
