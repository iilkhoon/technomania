import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class InventoryService {
  constructor(private dbService: DatabaseService) {}

  /**
   * Get all inventory items with optional filters
   */
  async getInventory(branchId?: string, status?: string) {
    let query = `
      SELECT ii.*, p.model_name, p.brand, p.barcode, b.name as branch_name 
      FROM inventory_items ii
      JOIN products p ON ii.product_id = p.id
      JOIN branches b ON ii.branch_id = b.id
    `;
    const params = [];
    const conditions = [];

    if (branchId) {
      params.push(branchId);
      conditions.push(`ii.branch_id = $${params.length}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`ii.status = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY ii.created_at DESC`;
    const result = await this.dbService.query(query, params);
    return result.rows;
  }

  /**
   * Initiate a stock transfer by IMEI
   */
  async createTransfer(
    imei: string,
    fromBranchId: string,
    toBranchId: string,
    senderId: string
  ) {
    // 1. Verify item is in stock at fromBranch
    const itemResult = await this.dbService.query(
      `SELECT * FROM inventory_items WHERE imei = $1 AND branch_id = $2 AND status = 'in_stock'`,
      [imei, fromBranchId]
    );

    if (itemResult.rows.length === 0) {
      throw new NotFoundException('Bu IMEI nömrəli və göndərilən filialda olan aktiv məhsul tapılmadı.');
    }
    const item = itemResult.rows[0];

    // Transaction to transfer stock and create records
    await this.dbService.query('BEGIN');
    try {
      // 2. Create Stock Transfer Record
      const transferResult = await this.dbService.query(
        `INSERT INTO stock_transfers (from_branch_id, to_branch_id, sender_id, status)
         VALUES ($1, $2, $3, 'in_transit') RETURNING *`,
        [fromBranchId, toBranchId, senderId]
      );
      const transfer = transferResult.rows[0];

      // 3. Add Item to transfer list
      await this.dbService.query(
        `INSERT INTO stock_transfer_items (transfer_id, inventory_item_id)
         VALUES ($1, $2)`,
        [transfer.id, item.id]
      );

      // 4. Update Inventory Item status to in_transit
      await this.dbService.query(
        `UPDATE inventory_items SET status = 'in_transit' WHERE id = $1`,
        [item.id]
      );

      await this.dbService.query('COMMIT');
      return transfer;
    } catch (err) {
      await this.dbService.query('ROLLBACK');
      throw err;
    }
  }

  /**
   * Complete the transfer and move stock to destination branch
   */
  async completeTransfer(transferId: string, receiverId: string) {
    const transferResult = await this.dbService.query(
      `SELECT * FROM stock_transfers WHERE id = $1 AND status = 'in_transit'`,
      [transferId]
    );

    if (transferResult.rows.length === 0) {
      throw new NotFoundException('Aktiv tranzit transfer tapılmadı.');
    }
    const transfer = transferResult.rows[0];

    // Find all items associated with this transfer
    const itemsResult = await this.dbService.query(
      `SELECT inventory_item_id FROM stock_transfer_items WHERE transfer_id = $1`,
      [transferId]
    );

    await this.dbService.query('BEGIN');
    try {
      // 1. Update transfer status
      await this.dbService.query(
        `UPDATE stock_transfers 
         SET status = 'completed', receiver_id = $1, received_at = NOW()
         WHERE id = $2`,
        [receiverId, transferId]
      );

      // 2. Update Inventory Items location and status
      for (const item of itemsResult.rows) {
        await this.dbService.query(
          `UPDATE inventory_items 
           SET branch_id = $1, status = 'in_stock' 
           WHERE id = $2`,
          [transfer.to_branch_id, item.inventory_item_id]
        );
      }

      await this.dbService.query('COMMIT');
      return { success: true, message: 'Transfer uğurla tamamlandı. Mallar yeni filiala qəbul edildi.' };
    } catch (err) {
      await this.dbService.query('ROLLBACK');
      throw err;
    }
  }
}
