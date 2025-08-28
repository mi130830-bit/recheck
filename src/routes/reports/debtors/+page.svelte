<!-- File: src/routes/reports/debtors/+page.svelte -->

<script lang="ts">
  export let data;
</script>

<main class="container">
  <header>
    <h1>รายงานลูกหนี้ (ยอดค้างชำระ)</h1>
    <p>แสดงรายการลูกค้าที่มียอดขายเชื่อคงค้าง</p>
  </header>
  
  {#if data.debtors.length === 0}
    <article>
      <p>ยอดเยี่ยม! ไม่มีลูกหนี้ค้างชำระในขณะนี้</p>
    </article>
  {:else}
    <table>
      <thead>
        <tr>
          <th>รหัสสมาชิก</th>
          <th>ชื่อลูกค้า</th>
          <th>เบอร์โทรศัพท์</th>
          <th style="text-align: right;">จำนวนบิล</th>
          <th style="text-align: right;">ยอดค้างชำระรวม</th>
        </tr>
      </thead>
      <tbody>
        {#each data.debtors as debtor (debtor.customerId)}
          <tr>
            <td>{debtor.customer?.memberCode || '-'}</td>
            <td>{debtor.customer?.firstName} {debtor.customer?.lastName || ''}</td>
            <td>{debtor.customer?.phone || '-'}</td>
            <td style="text-align: right;">{debtor.billCount}</td>
            <td style="text-align: right;"><strong>{debtor.totalDebt?.toFixed(2)}</strong></td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</main>