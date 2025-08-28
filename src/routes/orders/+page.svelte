<!-- File: src/routes/orders/+page.svelte -->

<script lang="ts">
  export let data;
</script>

<main class="container">
  <header>
    <h1>รายงานการขาย</h1>
  </header>

  {#if data.orders.length === 0}
    <article>
      <p>ยังไม่มีข้อมูลการขาย</p>
    </article>
  {:else}
    <table>
      <thead>
        <tr>
          <th>เลขที่บิล</th>
          <th>วันที่</th>
          <th>ลูกค้า</th>
          <th style="text-align: right;">ยอดรวม</th>
          <th>การกระทำ</th>
        </tr>
      </thead>
      <tbody>
        {#each data.orders as order (order.id)}
          <tr>
            <td><strong>{order.orderNumber}</strong></td>
            <td>
              {new Date(order.createdAt).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </td>
            <td>
              {order.customer ? `${order.customer.firstName} ${order.customer.lastName || ''}` : 'ลูกค้าทั่วไป'}
            </td>
            <td style="text-align: right;">{order.total.toFixed(2)}</td>
            <td>
              <!-- ลิงก์นี้จะพาไปหน้าดูรายละเอียดบิล ที่เราจะสร้างใน Step 2 -->
              <a href="/orders/{order.id}">ดูรายละเอียด</a>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</main>

<style>
  .container {
    max-width: 1100px;
    margin: 0 auto;
  }
</style>