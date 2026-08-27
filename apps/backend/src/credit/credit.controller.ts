import { Controller, Get, Post, Body, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { CreditService } from './credit.service';
import { AdminApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('credit')
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Post('apply')
  async apply(
    @Body('creditorId') creditorId: string,
    @Body('branchId') branchId: string,
    @Body('productId') productId: string,
    @Body('customerName') customerName: string,
    @Body('customerPin') customerPin: string,
    @Body('customerPhone') customerPhone: string,
    @Body('monthlyIncome') monthlyIncome: number,
    @Body('requestedMonths') requestedMonths: number
  ) {
    if (!customerName || !customerPin || !customerPhone) {
      throw new BadRequestException('Müştəri adı, FİN kodu və telefon nömrəsi mütləqdir.');
    }
    const cleanPin = String(customerPin).trim().toUpperCase();
    if (cleanPin.length < 5 || cleanPin.length > 10) {
      throw new BadRequestException('FİN kod düzgün formatda deyil.');
    }

    return this.creditService.submitApplication(
      creditorId ? String(creditorId).trim() : 'birkart',
      branchId ? String(branchId).trim() : 'narimanov',
      productId ? String(productId).trim() : '',
      String(customerName).trim().slice(0, 100),
      cleanPin,
      String(customerPhone).trim().slice(0, 30),
      Number(monthlyIncome) || 0,
      Number(requestedMonths) || 12
    );
  }

  @Get('list')
  @UseGuards(AdminApiKeyGuard)
  async list(@Query('branchId') branchId?: string) {
    return this.creditService.getApplications(branchId);
  }
}
