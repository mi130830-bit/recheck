<!-- src/routes/orders/[id]/+page.svelte (เพิ่มปุ่มพิมพ์ใบเสร็จ) -->

<script lang="ts">
  import { goto } from '$app/navigation'; // Import goto
  import { page } from '$app/stores'; // Import page store

  export let data;
  const { order } = data;
  let isLoading = false;
  let isDispatching = false;

  // ฟังก์ชันสำหรับยกเลิกบิล
  async function cancelOrder(shouldRestock: boolean) {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการยกเลิกบิล ${order.orderNumber}?`)) return;
    isLoading = true;
    try {
      const response = await fetch(`/api/orders/${order.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shouldRestock }),
      });
      const result = await response.json();
      alert(result.message);
      if (response.ok) window.location.reload();
    } finally {
      isLoading = false;
    }
  }

  // ฟังก์ชันสำหรับแจ้งเตือนส่งของ
  async function dispatchOrder() {
    isDispatching = true;
    try {
      const response = await fetch(`/api/orders/${order.id}/dispatch`, { method: 'POST' });
      const result = await response.json();
      if (response.ok) {
        alert(result.message);
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.error || 'ไม่ทราบสาเหตุ'}`);
      }
    } catch (error) {
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      isDispatching = false;
    }
  }
</script>

<main class="container">
  <div class="page-header">
      <a href="/orders">&larr; กลับไปที่รายการบิล</a>
      <!-- ✅ ADD: ปุ่มพิมพ์ใบเสร็จ -->
      {#if order.status !== 'CANCELLED'}
          <a href="/receipts/{order.id}?size=slip" target="_blank" class="print-button">
              🖨️ พิมพ์ใบเสร็จ
          </a>
      {/if}
  </div>

  <article>
    <header>
      <h2>รายละเอียดบิล: {order.orderNumber}</h2>
    </header>

    <div class="grid">
      <div>
        <strong>วันที่:</strong>
        {new Date(order.createdAt).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' })}
      </div>
      <div>
        <strong>ลูกค้า:</strong>
        {order.customer ? `${order.customer.firstName} ${order.customer.lastName || ''}` : 'ลูกค้าทั่วไป'}
      </div>
      <div>
        <strong>สถานะ:</strong>
        <span class="status-{order.status.toLowerCase()}">{order.status}</span>
      </div>
    </div>

    <h4>รายการสินค้า</h4>
    <table>
      <thead>
        <tr>
          <th>สินค้า</th>
          <th style="text-align: right;">ราคา/หน่วย</th>
          <th style="text-align: center;">จำนวน</th>
          <th style="text-align: right;">ราคารวม</th>
        </tr>
      </thead>
      <tbody>
        {#each order.items as item (item.id)}
          <tr>
            <td>{item.product.name}</td>
            <td style="text-align: right;">{item.price.toFixed(2)}</td>
            <td style="text-align: center;">{item.quantity}</td>
            <td style="text-align: right;">{(item.price * item.quantity).toFixed(2)}</td>
          </tr>
        {/each}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="text-align: right;"><strong>ยอดรวมสุทธิ</strong></td>
          <td style="text-align: right;"><strong>{order.total.toFixed(2)}</strong></td>
        </tr>
      </tfoot>
    </table>

    {#if order.status !== 'CANCELLED'}
      <footer class="actions">
        <button on:click={dispatchOrder} disabled={isDispatching} aria-busy={isDispatching}>
          🚚 แจ้งเตือนส่งของ
        </button>
        <button on:click={() => cancelOrder(true)} disabled={isLoading} class="secondary">
          ยกเลิก (คืนสต็อก)
        </button>
        <button on:click={() => cancelOrder(false)} disabled={isLoading} class="secondary contrast">
          ยกเลิก (ไม่คืนสต็อก)
        </button>
      </footer>
    {/if}
  </article>
</main>

<style>
  /* --- สไตล์ทั่วไป --- */
  .container { max-width: 800px; margin: 0 auto; padding: 1rem; }
  .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--pico-muted-border-color);
  }
  .page-header a { margin-bottom: 0; } /* ลบ margin-bottom ที่อาจมีจาก Pico */

  /* --- สไตล์ปุ่มพิมพ์ใบเสร็จ --- */
  .print-button {
      display: inline-flex; /* ให้ชิดกันเมื่อมีข้อความ */
      align-items: center;
      gap: 0.5rem;
      border-radius: 20px; /* ทำให้มน */
      font-weight: 500;
      /* ใช้สไตล์สีเขียวมิ้นท์ */
      --pico-background-color: transparent;
      --pico-border-color: #15cb24; /* --mint-green */
      --pico-color: #15cb24;       /* --mint-green */
  }
  .print-button:hover {
      --pico-background-color: #f0fafa; /* --mint-green-light */
      --pico-border-color: #26c217; /* --mint-green-hover */
      --pico-color: #26c217;       /* --mint-green-hover */
  }

  /* --- สไตล์อื่นๆ (ที่เหมือนเดิม) --- */
  .actions { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--pico-muted-border-color); }
  [class*='status-'] { padding: 0.25rem 0.5rem; border-radius: 99px; font-size: 0.8em; font-weight: bold; color: white; }
  .status-completed { background-color: #28a745; }
  .status-credit { background-color: #ffc107; color: black; }
  .status-held { background-color: #17a2b8; }
  .status-cancelled { background-color: #6c757d; }
  
  /* Optional: Add styles for table if needed */
  table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
  th, td { padding: 0.5rem; }
  th { text-align: left; }
  tfoot td { font-weight: bold; }
</style>