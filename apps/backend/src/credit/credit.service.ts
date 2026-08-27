import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class CreditService {
  constructor(
    private dbService: DatabaseService,
    private aiService: AiService
  ) {}

  /**
   * Submit credit application, evaluate with local AI pre-scoring, and request mock BOKT approvals
   */
  async submitApplication(
    creditorId: string,
    branchId: string,
    productId: string,
    customerName: string,
    customerPin: string,
    customerPhone: string,
    monthlyIncome: number,
    requestedMonths: number
  ) {
    // 1. Fetch product cash & credit price
    const prodResult = await this.dbService.query(
      `SELECT * FROM products WHERE id = $1`,
      [productId]
    );

    if (prodResult.rows.length === 0) {
      throw new NotFoundException('Seçilən məhsul tapılmadı.');
    }
    const product = prodResult.rows[0];
    const creditPrice = parseFloat(product.credit_price);

    // 2. Call AI scoring
    const aiResult = await this.aiService.predictCreditApproval(
      monthlyIncome,
      requestedMonths,
      creditPrice,
      customerPin
    );

    // 3. Simulate requests to BOKT APIs (EmbaFinans, Nova Credit, Brand Credit)
    const boktScores = [
      {
        name: 'Nova Credit',
        approved: aiResult.probability > 45,
        interestRate: 18.5,
        maxMonths: 18,
        monthlyPayment: (creditPrice * 1.185) / requestedMonths,
      },
      {
        name: 'EmbaFinans',
        approved: aiResult.probability > 50,
        interestRate: 20.0,
        maxMonths: 24,
        monthlyPayment: (creditPrice * 1.2) / requestedMonths,
      },
      {
        name: 'Techno Credit (Daxili)',
        approved: aiResult.probability > 30,
        interestRate: 24.0,
        maxMonths: 12,
        monthlyPayment: (creditPrice * 1.24) / requestedMonths,
      }
    ];

    // Save credit application in database
    const saveResult = await this.dbService.query(
      `INSERT INTO credit_applications (
        creditor_id, branch_id, product_id, customer_name, customer_pin, 
        customer_phone, monthly_income, requested_months, status, ai_probability
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        creditorId,
        branchId,
        productId,
        customerName,
        customerPin,
        customerPhone,
        monthlyIncome,
        requestedMonths,
        aiResult.probability > 40 ? 'approved' : 'rejected',
        aiResult.probability
      ]
    );

    return {
      application: saveResult.rows[0],
      aiAnalysis: aiResult,
      boktOffers: boktScores,
    };
  }

  async getApplications(branchId?: string) {
    let query = `
      SELECT ca.*, p.model_name, p.brand, b.name as branch_name 
      FROM credit_applications ca
      JOIN products p ON ca.product_id = p.id
      JOIN branches b ON ca.branch_id = b.id
    `;
    const params = [];
    if (branchId) {
      query += ` WHERE ca.branch_id = $1`;
      params.push(branchId);
    }
    query += ` ORDER BY ca.created_at DESC`;
    const result = await this.dbService.query(query, params);
    return result.rows;
  }
}
