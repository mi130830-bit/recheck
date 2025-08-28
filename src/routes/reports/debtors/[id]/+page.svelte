<!-- File: src/routes/reports/debtors/[id]/+page.svelte -->

<script lang="ts">
  export let data;
  
  // คำนวณยอดรวมค้างชำระทั้งหมด
  $: totalDebt = data.creditOrders.reduce((sum, order) => sum + order.total, 0);
</script>

<main class="container">
  <a href="/reports/debtors">&larr; กลับไปที่รายชื่อลูกหนี้</a>
  
  <article>
      <header>
          <h1>บิลค้างชำระของ: {data.customer.firstName} {data.customer.lastName || ''}</h1>
          <h3>ยอดรวมค้างชำระ: <span class="debt-total">{totalDebt.toFixed(2)} บาท</span></h3>
      </header>

      {#if data.creditOrders.length === 0}
        <p>ลูกค้ารายนี้ไม่มีบิลค้างชำระ</p>
      {:else}
        <table>
          <thead>
            <tr>
              <th>เลขที่บิล</th>
              <th>วันที่</th>
              <th style="text-align: right;">ยอดเงิน</th>
              <th>การกระทำ</th>
            </tr>
          </thead>
          <tbody>
            {#each data.creditOrders as order (order.id)}
              <tr>
                <td><a href="/orders/{order.id}">{order.orderNumber}</a></td>
                <td>{new Date(order.createdAt).toLocaleDateString('th-TH')}</td>
                <td style="text-align: right;">{order.total.toFixed(2)}</td>
                <td>
                  <!-- ในอนาคต ปุ่มนี้จะเปิด Modal สำหรับรับชำระเงิน -->
                  <button class="small-btn">รับชำระ</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
  </article>
</main>

<style>
    .container { max-width: 800px; margin: 0 auto; }
    a { margin-bottom: 1rem; display: inline-block; }
    .debt-total {
        color: var(--pico-color-red-500);
    }
    .small-btn {
        --pico-font-size: 0.8em;
        padding: 0.25rem 0.5rem;
    }
</style>