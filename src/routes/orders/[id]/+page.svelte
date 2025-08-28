<!-- File: src/routes/orders/[id]/+page.svelte -->

<script lang="ts">
  export let data;
  const { order } = data;
  let isLoading = false;
  let isDispatching = false;

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
  <a href="/orders">&larr; กลับไปที่รายการบิล</a>
  <article>
    <header>
      <h2>รายละเอียดบิล: {order.orderNumber}</h2>
    </header>

    <div class="grid">
      <div>
        <strong>วันที่:</strong
        > {new Date(order.createdAt).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' })}
      </div>
      <div>
        <strong>ลูกค้า:</strong
        > {order.customer ? `${order.customer.firstName} ${order.customer.lastName || ''}` : 'ลูกค้าทั่วไป'}
      </div>
      <div>
        <strong>สถานะ:</strong
        > <span class="status-{order.status.toLowerCase()}">{order.status}</span>
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
        <button on:click={() => cancelOrder(true)} disabled={isLoading} class="secondary"
          >ยกเลิก (คืนสต็อก)</button
        >
        <button on:click={() => cancelOrder(false)} disabled={isLoading} class="secondary contrast"
          >ยกเลิก (ไม่คืนสต็อก)</button
        >
      </footer>
    {/if}
  </article>
</main>

<style>
  .container { max-width: 800px; margin: 0 auto; }
  .actions { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--pico-muted-border-color); }
  [class*='status-'] { padding: 0.25rem 0.5rem; border-radius: 99px; font-size: 0.8em; font-weight: bold; color: white; }
  .status-completed { background-color: #28a745; }
  .status-credit { background-color: #ffc107; color: black; }
  .status-held { background-color: #17a2b8; }
  .status-cancelled { background-color: #6c757d; }
</style>