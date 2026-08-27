import { supabase } from './supabase';

export interface StockPriceUpdatePayload {
  productId: string;
  branchId?: string;
  newPrice?: number;
  newStockCount?: number;
  updatedBy: string;
}

/**
 * Broadcasts stock or price changes across ERP, POS terminals, and Storefront in real-time.
 */
export async function broadcastStockPriceUpdate(payload: StockPriceUpdatePayload) {
  try {
    const channel = supabase.channel('omnichannel-sync');
    await channel.send({
      type: 'broadcast',
      event: 'stock_price_changed',
      payload,
    });
    console.log('[OmnichannelSync] Broadcast sent successfully:', payload);
    return true;
  } catch (error) {
    console.error('[OmnichannelSync] Failed to broadcast update:', error);
    return false;
  }
}

/**
 * Subscribes to real-time stock/price changes from ERP or POS.
 */
export function subscribeToOmnichannelSync(onUpdate: (payload: StockPriceUpdatePayload) => void) {
  const channel = supabase
    .channel('omnichannel-sync')
    .on('broadcast', { event: 'stock_price_changed' }, (response) => {
      if (response.payload) {
        onUpdate(response.payload as StockPriceUpdatePayload);
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
