/**
 * Export utilities for CSV (Excel compatible with UTF-8 BOM) and PDF Invoice printing
 */

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  if (typeof window === 'undefined') return;

  const csvLines = [
    headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
  ];

  const csvContent = '\uFEFF' + csvLines.join('\n'); // \uFEFF is UTF-8 BOM for Excel
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printOrderInvoice(order: any) {
  if (typeof window === 'undefined') return;

  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return;

  const items = Array.isArray(order.items) ? order.items : [];
  const rawTotal = order.total ?? order.totalAmount ?? 0;
  const total = typeof rawTotal === 'number' ? rawTotal : (parseFloat(String(rawTotal)) || 0);

  const html = `
    <!DOCTYPE html>
    <html lang="az">
    <head>
      <meta charset="UTF-8">
      <title>Sifariş Fakturası — ${order.id}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 40px; color: #0f172a; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #4f533b; letter-spacing: -0.5px; }
        .invoice-title { font-size: 18px; font-weight: 600; text-align: right; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; font-size: 13px; }
        .info-box h4 { margin: 0 0 8px 0; font-size: 12px; color: #64748b; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
        th { background: #f1f5f9; text-align: left; padding: 10px 12px; border-bottom: 1px solid #cbd5e1; font-weight: 600; }
        td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
        .total-box { text-align: right; font-size: 16px; font-weight: bold; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
        .footer { margin-top: 50px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">TECHNOMANIA</div>
          <div style="font-size: 12px; color: #64748b;">Rəsmi Elektrotexnika Mağazası</div>
        </div>
        <div class="invoice-title">
          SİFARİŞ FAKTURASI<br>
          <span style="font-size: 14px; font-weight: normal; color: #64748b;">№ ${order.id}</span>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-box">
          <h4>Müştəri Məlumatları</h4>
          <strong>${order.customer || order.customerName || 'Ad Qeyd Edilməyib'}</strong><br>
          📱 Tel: ${order.phone || order.customerPhone || '—'}<br>
          📍 Ünvan: ${order.address || order.city || 'Bakı, Azərbaycan'}
          ${order.fin ? `<br>🔑 FİN: <strong>${order.fin}</strong>` : ''}
          ${order.id_card ? `<br>🪪 Ş/V: <strong>${order.id_card}</strong>` : ''}
        </div>
        <div class="info-box">
          <h4>Ödəniş Və Tarix</h4>
          📅 Tarix: ${order.date || order.createdAt || new Date().toLocaleDateString('az-AZ')}<br>
          💳 Ödəniş Üsulu: ${order.payment || (order.paymentMethod === 'credit' ? 'Hissə-hissə Kredit' : 'Nağd / Onlayn')}<br>
          📌 Status: ${order.status || 'Yeni'}
          ${order.promo_code ? `<br>🎟️ Promo: <strong>${order.promo_code}</strong>` : ''}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Məhsul Adı</th>
            <th>Miqdar</th>
            <th>Qiymət</th>
            <th style="text-align: right;">Cəmi</th>
          </tr>
        </thead>
        <tbody>
          ${items.length > 0 ? items.map((it: any, idx: number) => {
            const itPrice = typeof it.price === 'number' ? it.price : (parseFloat(String(it.price || 0)) || 0);
            const itQty = typeof it.quantity === 'number' ? it.quantity : (typeof it.qty === 'number' ? it.qty : (parseInt(String(it.quantity || it.qty || 1), 10) || 1));
            return `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${it.name || 'Məhsul'}</strong></td>
                <td>${itQty} ədəd</td>
                <td>${itPrice.toFixed(2)} ₼</td>
                <td style="text-align: right;"><strong>${(itPrice * itQty).toFixed(2)} ₼</strong></td>
              </tr>
            `;
          }).join('') : `
            <tr>
              <td colspan="5" style="text-align: center; color: #64748b;">Məhsul məlumatı mövcud deyil</td>
            </tr>
          `}
        </tbody>
      </table>

      <div class="total-box">
        Yekun Məbləğ: ${total.toFixed(2)} ₼
      </div>

      <div class="footer">
        TechnoMania ERP Avtomatlaşdırılmış Sistem • Bütün hüquqlar qorunur.
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
