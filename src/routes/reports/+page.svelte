<!-- File: src/routes/reports/+page.svelte -->
<script lang="ts">
  export let data;
</script>
<main class="container">
  <h1>Dashboard สรุปยอดขาย</h1>
  
  <!-- การ์ดสรุปยอด -->
  <div class="grid">
    <article>
      <h4>ยอดขายวันนี้</h4>
      <h2>฿{data.stats.todayRevenue.toFixed(2)}</h2>
      <p>{data.stats.todayOrders} บิล</p>
    </article>
    <article>
      <h4>ยอดขายทั้งหมด</h4>
      <h2>฿{data.stats.allTimeRevenue.toFixed(2)}</h2>
      <p>{data.stats.allTimeOrders} บิล</p>
    </article>
  </div>

  <!-- ตารางบิลล่าสุด -->
  <h3>10 บิลล่าสุด</h3>
  <table>
    <thead><tr><th>เลขที่บิล</th><th>วันที่</th><th>ลูกค้า</th><th>สถานะ</th><th class="right">ยอดรวม</th></tr></thead>
    <tbody>
      {#each data.recentOrders as order (order.id)}
        <tr>
          <td><a href="/orders/{order.id}">{order.orderNumber}</a></td>
          <td>{new Date(order.createdAt).toLocaleString('th-TH')}</td>
          <td>{order.customer?.firstName || 'ลูกค้าทั่วไป'}</td>
          <td><span class="status-{order.status.toLowerCase()}">{order.status}</span></td>
          <td class="right">{order.total.toFixed(2)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</main>
<style>
  .container { max-width: 960px; margin: 0 auto; }
  h2 { color: var(--pico-primary); }
  .right { text-align: right; }
  /* สไตล์สำหรับป้ายสถานะ */
  [class*="status-"] { padding: 0.25rem 0.5rem; border-radius: 99px; font-size: 0.8em; font-weight: bold; color: white; }
  .status-completed { background-color: #28a745; }
  .status-credit { background-color: #ffc107; color: black; }
  .status-held { background-color: #17a2b8; }
  .status-cancelled { background-color: #dc3545; }
</style>