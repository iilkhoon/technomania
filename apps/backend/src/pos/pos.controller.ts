import { Controller, Get, Post, Body, Param, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { PosService } from './pos.service';
import { AdminApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('pos')
@UseGuards(AdminApiKeyGuard)
export class PosController {
  constructor(private readonly posService: PosService) {}

  @Get('scan-barcode/:barcode')
  async scanBarcode(@Param('barcode') barcode: string) {
    return this.posService.scanBarcode(barcode);
  }

  @Get('scan-imei/:imei')
  async scanImei(@Param('imei') imei: string) {
    return this.posService.scanImei(imei);
  }

  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  async checkout(
    @Body('cashierId') cashierId: string,
    @Body('branchId') branchId: string,
    @Body('paymentMethod') paymentMethod: string,
    @Body('imeiList') imeiList: string[]
  ) {
    return this.posService.checkout(cashierId, branchId, paymentMethod, imeiList);
  }
}
