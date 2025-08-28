<!-- File: src/routes/reports/top-selling/+page.svelte -->

<script lang="ts">
  export let data;
</script>

<main class="container">
  <header>
    <h1>รายงาน 10 อันดับสินค้าขายดี (ตามจำนวน)</h1>
  </header>
  
  {#if data.topSellingProducts.length === 0}
    <article>
      <p>ยังไม่มีข้อมูลการขายเพียงพอที่จะสร้างรายงานได้</p>
    </article>
  {:else}
    <table>
      <thead>
        <tr>
          <th style="width: 50px;">อันดับ</th>
          <th>บาร์โค้ด</th>
          <th>ชื่อสินค้า</th>
          <th style="text-align: right;">จำนวนที่ขายได้</th>
        </tr>
      </thead>
      <tbody>
        {#each data.topSellingProducts as item, i}
          <tr>
            <td><strong>{i + 1}</strong></td>
            <td>{item.barcode}</td>
            <td>{item.name}</td>
            <td style="text-align: right;">{item.totalQuantity}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</main>