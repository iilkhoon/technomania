import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PosService {
  constructor(private dbService: DatabaseService) {}

  /**
   * Scan product barcode to retrieve product specifications and price
   */
  async scanBarcode(barcode: string) {
    const result = await this.dbService.query(
      `SELECT * FROM products WHERE barcode = $1`,
      [barcode]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Bu barkodlu məhsul tapılmadı.');
    }

    return result.rows[0];
  }

  /**
   * Scan IMEI to get specific inventory item
   */
  async scanImei(imei: string) {
    const result = await this.dbService.query(
      `SELECT ii.*, p.model_name, p.brand, p.cash_price, p.credit_price 
       FROM inventory_items ii 
       JOIN products p ON ii.product_id = p.id 
       WHERE ii.imei = $1 AND ii.status = 'in_stock'`,
      [imei]
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Bu IMEI nömrəli cihaz anbarda tapılmadı və ya satılıb.');
    }

    return result.rows[0];
  }

  /**
   * Complete the POS sale and trigger E-kassa receipt creation
   */
  async checkout(cashierId: string, branchId: string, paymentMethod: string, imeiList: string[]) {
    if (!imeiList || imeiList.length === 0) {
      throw new BadRequestException('Səbətdə məhsul yoxdur.');
    }

    // 1. Verify items exist and are in_stock
    const itemsResult = await this.dbService.query(
      `SELECT ii.id, ii.product_id, p.cash_price, p.credit_price, ii.imei
       FROM inventory_items ii
       JOIN products p ON ii.product_id = p.id
       WHERE ii.imei = ANY($1) AND ii.status = 'in_stock'`,
      [imeiList]
    );

    if (itemsResult.rows.length !== imeiList.length) {
      throw new BadRequestException('Səbətdəki bəzi IMEI-lər mövcud deyil və ya artıq satılıb.');
    }

    // Determine price key based on payment method
    const priceKey = paymentMethod === 'credit' ? 'credit_price' : 'cash_price';
    let totalAmount = 0;
    itemsResult.rows.forEach(item => {
      totalAmount += parseFloat(item[priceKey]);
    });

    // Start database transaction
    await this.dbService.query('BEGIN');

    try {
      // 2. Generate Simulated E-kassa receipt
      const receiptNumber = 'EKAS-' + Math.floor(10000000 + Math.random() * 90000000);
      const receiptUrl = `https://e-kassa.gov.az/receipts?id=${receiptNumber}&amount=${totalAmount}`;

      // 3. Create Sale
      const saleResult = await this.dbService.query(
        `INSERT INTO sales (cashier_id, branch_id, payment_method, total_amount, receipt_number, receipt_url)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [cashierId, branchId, paymentMethod, totalAmount, receiptNumber, receiptUrl]
      );

      const sale = saleResult.rows[0];

      // 4. Create Sale Items & Update Inventory Status
      for (const item of itemsResult.rows) {
        await this.dbService.query(
          `INSERT INTO sale_items (sale_id, inventory_item_id, price)
           VALUES ($1, $2, $3)`,
          [sale.id, item.id, item[priceKey]]
        );

        await this.dbService.query(
          `UPDATE inventory_items SET status = 'sold' WHERE id = $1`,
          [item.id]
        );
      }

      await this.dbService.query('COMMIT');

      return {
        success: true,
        sale,
        items: itemsResult.rows,
        receipt: {
          receiptNumber,
          receiptUrl,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(receiptUrl)}`
        }
      };

    } catch (error) {
      await this.dbService.query('ROLLBACK');
      throw error;
    }
  }
}
