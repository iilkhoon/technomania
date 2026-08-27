import { Module } from '@nestjs/common';
import { BossController } from './boss.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [BossController],
})
export class BossModule {}
