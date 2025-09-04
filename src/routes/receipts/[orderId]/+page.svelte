<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';

  export let data: PageData;

  const { receiptData } = data;
  const { order, shopInfo } = receiptData || {};

  let paperSize = $page.url.searchParams.get('size') || 'slip';

  function handlePrint() {
    window.print();
  }
</script>

{#if order}
  <div class="page-container">
    <div class="print-controls">
      <div class="control-row">
        <div class="page-size-selector">
          <label>
            <input type="radio" name="size" value="slip" bind:group={paperSize} /> 80mm
          </label>
          <label>
            <input type="radio" name="size" value="a5" bind:group={paperSize} /> A5
          </label>
          <label>
            <input type="radio" name="size" value="a4" bind:group={paperSize} /> A4
          </label>
        </div>
        <button on:click={handlePrint} class="print-button">🖨️ พิมพ์</button>
      </div>
    </div>
    
    <div
      class="receipt"
      class:a4={paperSize === 'a4'}
      class:a5={paperSize === 'a5'}
      class:slip={paperSize === 'slip'}
    >
      <header class="receipt-header">
        <h2>ใบเสร็จรับเงิน</h2>
        {#if shopInfo?.receiptLogoUrl}
          <img src={shopInfo.receiptLogoUrl} alt="logo" class="logo" />
        {/if}
        <h1>{shopInfo?.storeName || 'My POS Store'}</h1>
        <p>{shopInfo?.address || ''}</p>
        <p>โทร. {shopInfo?.phone || ''} | เลขประจำตัวผู้เสียภาษี: {shopInfo?.taxId || ''}</p>
        <div class="order-details">
          <div><strong>เลขที่:</strong> {order.orderNumber}</div>
          <div>
            <strong>วันที่:</strong>
            {new Date(order.createdAt).toLocaleString('th-TH', {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          {#if order.customer}
            <div><strong>ลูกค้า:</strong> {order.customer.firstName} {order.customer.lastName || ''}</div>
          {/if}
        </div>
      </header>

      <table class="items-table">
        <thead>
          <tr>
            <th>รายการ</th>
            <th class="center">จำนวน</th>
            <th class="right">ราคา</th>
            <th class="right">รวม</th>
          </tr>
        </thead>
        <tbody>
          {#each order.items as item}
            <tr>
              <td>{item.product.name}</td>
              <td class="center">{item.quantity}</td>
              <td class="right">{item.price.toFixed(2)}</td>
              <td class="right">{((item.price - item.discount) * item.quantity).toFixed(2)}</td>
            </tr>
          {/each}
        </tbody>
      </table>

      <section class="summary">
        <hr class="dashed" />
        <div class="summary-row">
          <span>รวมเป็นเงิน</span>
          <strong>{order.total.toFixed(2)}</strong>
        </div>
        {#if order.received}
          <div class="summary-row">
            <span>รับเงินสด</span>
            <span>{order.received.toFixed(2)}</span>
          </div>
        {/if}
        {#if order.change}
          <div class="summary-row">
            <span>เงินทอน</span>
            <span>{order.change.toFixed(2)}</span>
          </div>
        {/if}
      </section>

      <footer class="receipt-footer">
        <hr class="dashed" />
        <p>{shopInfo?.receiptNote || 'ขอบคุณที่ใช้บริการ'}</p>
      </footer>
    </div>
  </div>
{:else}
  <div class="page-container">
    <p>ไม่พบข้อมูลบิลที่ระบุ</p>
  </div>
{/if}

<style>
  /* === สไตล์สำหรับแสดงผลบนหน้าจอ (Preview) === */
  .page-container {
    background-color: #e0e0e0;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 0;
    min-height: 100vh;
  }
  .receipt {
    background-color: white;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
    color: #000;
  }
  .print-controls {
    max-width: 800px;
    width: 90%;
    margin-bottom: 1rem;
    padding: 1rem;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  .control-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .page-size-selector {
    display: flex;
    gap: 1rem;
    white-space: nowrap; 
  }
  .page-size-selector label {
    margin-bottom: 0;
  }

  .print-button {
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 1em;
    min-width: 100px;
  }
  .print-button:hover {
    background-color: #218838;
  }

  /* === สไตล์ตามขนาดกระดาษ === */
  /* ✅ เพิ่ม padding-top สำหรับ slip ให้มากขึ้น */
  .slip { width: 72mm; padding: 24px 12px 12px 12px; font-family: 'Courier New', Courier, monospace; font-size: 10pt; }
  .a5, .a4 { width: 148mm; min-height: 210mm; padding: 10mm; font-family: Arial, sans-serif; font-size: 10pt; }
  .a4 { width: 210mm; min-height: 297mm; padding: 15mm; }

  /* === สไตล์ทั่วไปของใบเสร็จ === */
  .receipt-header {
    text-align: center;
    /* ✅ เพิ่ม padding-top เพื่อดันเนื้อหาลงมา */
    padding-top: 1cm; /* ปรับค่านี้ตามที่คุณต้องการ */
  }
  .receipt-header h2 { margin: 0 0 0.75rem 0; font-size: 1.2em; }
  .logo { max-width: 60%; max-height: 80px; margin-bottom: 0.5rem; }
  .receipt-header h1 { margin: 0; font-size: 1.3em; }
  .receipt-header p { margin: 2px 0; font-size: 0.9em; }
  .order-details {
    text-align: left;
    font-size: 0.9em;
    margin-top: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px dashed #555;
  }
  .items-table { width: 100%; border-collapse: collapse; font-size: 0.9em; margin-top: 0.5rem; }
  .items-table th, .items-table td { padding: 0.25rem 0; }
  .items-table thead { border-top: 1px dashed #555; border-bottom: 1px dashed #555; }
  .center { text-align: center; }
  .right { text-align: right; }
  .summary { margin-top: 0.5rem; }
  .summary-row { display: flex; justify-content: space-between; font-size: 1em; margin: 0.3rem 0; }
  hr.dashed { border: none; border-top: 1px dashed #555; margin: 0.5rem 0; }
  .receipt-footer { text-align: center; font-size: 1em; margin-top: 0.5rem; }
  .receipt-footer p { margin: 0; }

  /* === สไตล์พิเศษสำหรับตอนสั่งพิมพ์ === */
  @media print {
    body, .page-container { background-color: white; }
    .page-container { padding: 0; justify-content: flex-start; }
    .receipt { width: 100%; min-height: 0; box-shadow: none; margin: 0; padding: 0; }
    .print-controls {
      display: none;
    }
  }
  @page {
    /* ✅ ลด margin-top กลับเป็นค่าที่ต้องการสำหรับขอบกระดาษจริง */
    margin-top: 0.5cm;
    margin-bottom: 0.5cm;
    margin-left: 0.5cm;
    margin-right: 0.5cm;
  }
</style>