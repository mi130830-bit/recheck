<!-- File: src/routes/reports/low-stock/+page.svelte -->

<script lang="ts">
  export let data;
</script>

<main class="container">
  <header>
    <h1>รายงานสินค้าที่ต้องสั่งซื้อ (สต็อกใกล้หมด)</h1>
    <p>แสดงรายการสินค้าที่มีจำนวนคงคลังน้อยกว่าหรือเท่ากับจุดสั่งซื้อ</p>
  </header>
  
  {#if data.lowStockProducts.length === 0}
    <article>
      <p>เยี่ยมมาก! ไม่มีสินค้าที่สต็อกใกล้หมดในขณะนี้</p>
    </article>
  {:else}
    <table>
      <thead>
        <tr>
          <th>บาร์โค้ด</th>
          <th>ชื่อสินค้า</th>
          <th style="text-align: right;">คงคลัง</th>
          <th style="text-align: right;">จุดสั่งซื้อ</th>
          <th>ผู้ขาย</th>
        </tr>
      </thead>
      <tbody>
        {#each data.lowStockProducts as item (item.id)}
          <tr class="warning">
            <td>{item.barcode || '-'}</td>
            <td>{item.name}</td>
            <td style="text-align: right;"><strong>{item.stockQuantity}</strong></td>
            <td style="text-align: right;">{item.reorderPoint}</td>
            <td>{item.supplier.name}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</main>
<style>
    .container { max-width: 960px; margin: 0 auto; }
    .warning {
        /* สีพื้นหลังโทนเหลืองอ่อนๆ เพื่อเตือน */
        --pico-table-row-stripped-background-color: #fff3cd;
    }
</style>