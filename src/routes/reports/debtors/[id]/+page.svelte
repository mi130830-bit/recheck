<!-- Path: src/routes/reports/debtors/[id]/+page.svelte (Final Corrected Version) -->

<script lang="ts">
    import { enhance } from '$app/forms';
    import { page } from '$app/stores';
    import type { PageData } from './$types'; // [เพิ่ม] Import PageData

    export let data: PageData; // [แก้ไข] ระบุ Type
    $: ({ customer, creditOrders } = data); // [แก้ไข] ใช้ Reactive statement

    let selectedOrders: number[] = [];
    
    // [แก้ไข] ย้ายการคำนวณ totalDebt มาเป็น reactive statement
    $: totalDebt = creditOrders ? creditOrders.reduce((sum, order) => sum + order.total, 0) : 0;
</script>

<div class="container">
    <a href="/reports/debtors">&larr; กลับไปหน้ารายงานลูกหนี้</a>
    <header>
        <h1>บิลค้างชำระของ: {customer.name}</h1>
        <p><strong>รหัสสมาชิก:</strong> {customer.memberCode} | <strong>ยอดรวม:</strong> {totalDebt.toFixed(2)} บาท</p>
    </header>

    <!-- [แก้ไข] เพิ่มการตรวจสอบ creditOrders ก่อน -->
    {#if !creditOrders || creditOrders.length === 0}
        <article><p>🎉 ลูกค้ารายนี้ไม่มีบิลค้างชำระแล้ว</p></article>
    {:else}
        <div class="invoice-section">
            <form method="POST" action="?/createInvoice" use:enhance>
                <table>
                    <thead>
                        <tr>
                            <th>เลือก</th>
                            <th>เลขที่บิล</th>
                            <th>วันที่</th>
                            <th style="text-align: right;">ยอดเงิน</th>
                            <!-- [เพิ่ม] เพิ่ม Header ว่างสำหรับคอลัมน์ Action -->
                            <th></th> 
                        </tr>
                    </thead>
                    <tbody>
                        {#each creditOrders as order (order.id)}
                            <tr>
                                <td><input type="checkbox" name="selectedOrders" value={order.id} bind:group={selectedOrders} /></td>
                                <td><a href="/orders/{order.id}?from={$page.url.pathname}">{order.orderNumber}</a></td>
                                <td>{new Date(order.createdAt).toLocaleDateString('th-TH')}</td>
                                <!-- ข้อมูล `total` ถูกแปลงเป็น Number มาแล้ว ใช้ .toFixed ได้เลย -->
                                <td style="text-align: right;">{order.total.toFixed(2)}</td>
                                <!-- [แก้ไข] ย้าย Action มาไว้ในคอลัมน์สุดท้ายของตาราง -->
                                <td>
                                    <form 
                                        method="POST" 
                                        action="?/settleDebt" 
                                        use:enhance
                                        on:submit|preventDefault={(e) => {
                                            if (confirm(`ยืนยันการรับชำระบิล #${order.orderNumber} ?`)) {
                                                e.currentTarget.submit();
                                            }
                                        }}
                                    >
                                        <input type="hidden" name="orderId" value={order.id} />
                                        <button type="submit" class="outline small">รับชำระ</button>
                                    </form>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
                <footer style="margin-top: 1rem;">
                    <button type="submit" disabled={selectedOrders.length === 0}>
                        สร้างใบวางบิล ({selectedOrders.length} รายการ)
                    </button>
                </footer>
            </form>
        </div>
    {/if}
</div>

<style>
    .container { max-width: 800px; margin: 2rem auto; }
    header { margin: 2rem 0; text-align: center; }
    form { margin: 0; }
    button.small { padding: 0.25rem 0.5rem; font-size: 0.85em; }
    /* [ลบออก] CSS Grid ไม่จำเป็นแล้ว */
</style>