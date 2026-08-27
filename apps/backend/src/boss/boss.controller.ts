import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { AdminApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('boss')
@UseGuards(AdminApiKeyGuard)
export class BossController {
  constructor(private readonly aiService: AiService) {}

  @Post('query')
  async askQuestion(@Body('question') question: string) {
    return this.aiService.askBossDashboard(question);
  }
}
