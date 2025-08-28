<!-- Path: src/routes/reports/debtors/[id]/+page.svelte (ฉบับแก้ไข form ซ้อน form) -->

<script lang="ts">
    import { enhance } from '$app/forms';
    import { page } from '$app/stores';

    export let data;
    const { customer, creditOrders } = data;

    let selectedOrders: number[] = [];
    const totalDebt = creditOrders.reduce((sum, order) => sum + order.total, 0);
</script>

<div class="container">
    <a href="/reports/debtors">&larr; กลับไปหน้ารายงานลูกหนี้</a>
    <header>
        <h1>บิลค้างชำระของ: {customer.name}</h1>
        <p><strong>รหัสสมาชิก:</strong> {customer.memberCode} | <strong>ยอดรวม:</strong> {totalDebt.toFixed(2)} บาท</p>
    </header>

    {#if creditOrders.length === 0}
        <article><p>🎉 ลูกค้ารายนี้ไม่มีบิลค้างชำระแล้ว</p></article>
    {:else}
        <!-- [แก้ไข] ใช้ div ครอบแทน form -->
        <div class="invoice-section">
            <form method="POST" action="?/createInvoice">
                <table>
                    <thead>
                        <tr>
                            <th>เลือก</th>
                            <th>เลขที่บิล</th>
                            <th>วันที่</th>
                            <th style="text-align: right;">ยอดเงิน</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each creditOrders as order}
                            <tr>
                                <td>
                                    <input type="checkbox" name="selectedOrders" value={order.id} bind:group={selectedOrders} />
                                </td>
                                <td>
                                    <a href="/orders/{order.id}?from={$page.url.pathname}">{order.orderNumber}</a>
                                </td>
                                <td>{new Date(order.createdAt).toLocaleDateString('th-TH')}</td>
                                <td style="text-align: right;">{order.total.toFixed(2)}</td>
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

            <!-- [เพิ่ม] สร้างตารางแยกสำหรับปุ่มรับชำระ -->
            <div class="settle-actions">
                {#each creditOrders as order}
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
                        <button type="submit">รับชำระ</button>
                    </form>
                {/each}
            </div>
        </div>
    {/if}
</div>

<style>
    .container { max-width: 800px; margin: 2rem auto; }
    header { margin: 2rem 0; text-align: center; }
    form { margin: 0; }
    
    /* [เพิ่ม] ใช้ CSS Grid จัด Layout ให้เหมือนเดิม */
    .invoice-section {
        display: grid;
        grid-template-columns: 1fr auto; /* แบ่งเป็น 2 คอลัมน์ */
        align-items: start;
    }
    .settle-actions {
        display: flex;
        flex-direction: column;
        gap: 1.1rem; /* ระยะห่างให้ตรงกับแถวตาราง */
        padding-top: 3.2rem; /* ดันลงมาให้ตรงกับเนื้อหาตาราง */
        margin-left: 1rem;
    }
    .settle-actions form button {
        margin: 0;
    }
</style>