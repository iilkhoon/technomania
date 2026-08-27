export interface PurchaseOrder {
  id: string;
  productId: string;
  productName: string;
  supplierName: string;
  currentStock: number;
  thresholdLimit: number;
  recommendedOrderQty: number;
  estimatedCost: number;
  status: 'draft' | 'sent' | 'received' | 'cancelled';
  createdAt: string;
}

/**
 * Checks inventory for low stock items and auto-generates Purchase Orders (PO).
 */
export function generateAutoPurchaseOrders(
  products: { id: string; name: string; stock: number; threshold: number; costPrice: number; supplier: string }[]
): PurchaseOrder[] {
  const lowStockItems = products.filter((p) => p.stock <= p.threshold);

  return lowStockItems.map((item) => {
    const recommendedQty = Math.max(item.threshold * 3 - item.stock, 10);
    return {
      id: `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId: item.id,
      productName: item.name,
      supplierName: item.supplier || 'Rəsmi Distribütor MMC',
      currentStock: item.stock,
      thresholdLimit: item.threshold,
      recommendedOrderQty: recommendedQty,
      estimatedCost: recommendedQty * item.costPrice,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
  });
}
