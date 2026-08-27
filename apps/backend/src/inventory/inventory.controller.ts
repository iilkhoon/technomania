import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AdminApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('inventory')
@UseGuards(AdminApiKeyGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('list')
  async getInventory(
    @Query('branchId') branchId?: string,
    @Query('status') status?: string
  ) {
    return this.inventoryService.getInventory(branchId, status);
  }

  @Post('transfer')
  async createTransfer(
    @Body('imei') imei: string,
    @Body('fromBranchId') fromBranchId: string,
    @Body('toBranchId') toBranchId: string,
    @Body('senderId') senderId: string
  ) {
    return this.inventoryService.createTransfer(imei, fromBranchId, toBranchId, senderId);
  }

  @Post('receive')
  async completeTransfer(
    @Body('transferId') transferId: string,
    @Body('receiverId') receiverId: string
  ) {
    return this.inventoryService.completeTransfer(transferId, receiverId);
  }
}
