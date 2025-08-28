<!-- Path: src/routes/reports/debtors/[id]/+page.svelte (ฉบับเพิ่ม Form) -->

<script lang="ts">
    import { enhance } from '$app/forms';
    import { page } from '$app/stores'; // [เพิ่ม] import page store

    export let data;
    const { customer, creditOrders } = data;

    const totalDebt = creditOrders.reduce((sum, order) => sum + order.total, 0);
</script>

<div class="container">
    <a href="/reports/debtors">&larr; กลับไปหน้ารายงานลูกหนี้</a>
    <header>
        <h1>บิลค้างชำระของ: {customer.name}</h1>
        <p><strong>รหัสสมาชิก:</strong> {customer.memberCode} | <strong>ยอดรวม:</strong> {totalDebt.toFixed(2)} บาท</p>
    </header>

    {#if creditOrders.length === 0}
        <article>
            <p>🎉 ลูกค้ารายนี้ไม่มีบิลค้างชำระแล้ว</p>
        </article>
    {:else}
        <table>
            <thead>
                <tr>
                    <th>เลขที่บิล</th>
                    <th>วันที่</th>
                    <th style="text-align: right;">ยอดเงิน</th>
                    <th style="text-align: center;">การกระทำ</th>
                </tr>
            </thead>
            <tbody>
                {#each creditOrders as order}
                    <tr>
                        <td>
                            <!-- [แก้ไข] เพิ่ม query parameter 'from' เข้าไปในลิงก์ -->
                            <a href="/orders/{order.id}?from={$page.url.pathname}">{order.orderNumber}</a>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString('th-TH')}</td>
                        <td style="text-align: right;">{order.total.toFixed(2)}</td>
                        <td style="text-align: center;">
                            <!-- [แก้ไข] เปลี่ยนปุ่มเป็นฟอร์มที่ทำงานได้จริง -->
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
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</div>

<style>
    .container { max-width: 800px; margin: 2rem auto; }
    header { margin: 2rem 0; text-align: center; }
    form { margin: 0; } /* ป้องกัน form สร้าง margin เพิ่ม */
</style>