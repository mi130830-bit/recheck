<!-- Path: src/routes/billing/[id]/+page.svelte (Final Corrected Version) -->

<script lang="ts">
    import { enhance } from '$app/forms';
    import type { PageData } from './$types';
    export let data: PageData;
    export let form;
    $: ({ billingNote, companyInfo } = data); 
</script>

<svelte:head>
    <title>ใบวางบิล #{billingNote.bnNumber}</title>
</svelte:head>

<main class="container">
    <div class="toolbar no-print">
        <a href="/billing" role="button" class="secondary outline">&larr; กลับไปที่รายการทั้งหมด</a>
    </div>

    <article class="invoice-paper">
        <header class="invoice-header">
            <h1>{companyInfo.name}</h1>
            <p>{companyInfo.address}</p>
            <p>เลขประจำตัวผู้เสียภาษี: {companyInfo.taxId} | โทร: {companyInfo.phone}</p>
        </header>

        <section class="invoice-title">
            <h2>ใบวางบิล / INVOICE</h2>
        </section>

        <section class="meta-info">
            <div class="customer-details">
                <p><strong>ลูกค้า:</strong> {billingNote.customer.name}</p>
                <p><strong>ที่อยู่:</strong> {billingNote.customer.address || '-'}</p>
            </div>
            <div class="invoice-details">
                <p><strong>เลขที่:</strong> {billingNote.bnNumber}</p>
                <p><strong>วันที่:</strong> {new Date(billingNote.createdAt).toLocaleDateString('th-TH')}</p>
                <p><strong>สถานะ:</strong> 
                    <span class="status-tag status-{billingNote.status.toLowerCase()}">
                        {billingNote.status}
                    </span>
                </p>
            </div>
        </section>

        <section class="items-table">
            <table>
                <thead>
                    <tr>
                        <th class="col-no">#</th>
                        <th class="col-date">วันที่</th>
                        <th class="col-desc">เลขที่เอกสารอ้างอิง</th>
                        <th class="col-total">จำนวนเงิน</th>
                    </tr>
                </thead>
                <tbody>
                    {#each billingNote.items as item, i}
                        <tr>
                            <td class="col-no">{i + 1}</td>
                            <td class="col-date">{new Date(item.order.createdAt).toLocaleDateString('th-TH')}</td>
                            <td class="col-desc">
                                <a href="/orders/{item.order.id}" target="_blank">{item.order.orderNumber}</a>
                            </td>
                            <td class="col-total">{item.order.total.toFixed(2)}</td>
                        </tr>
                    {/each}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" class="summary-label">ยอดรวมทั้งสิ้น (Total)</td>
                        <td class="summary-total">{billingNote.totalAmount.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
        </section>

        <footer class="signature-section">
            <div class="signature-box">
                <p>.................................................</p>
                <p>(ผู้รับวางบิล)</p>
                <p>วันที่ ......./......./...........</p>
            </div>
            <div class="signature-box">
                <p>.................................................</p>
                <p>(ผู้วางบิล)</p>
                <p>ในนาม {companyInfo.name}</p>
            </div>
        </footer>

    </article>

    <div class="action-footer no-print">
        {#if billingNote.status === 'PENDING'}
            <form method="POST" action="?/cancelBillingNote" use:enhance on:submit={() => confirm('ยืนยันการยกเลิกใบวางบิลนี้?')}>
                <button type="submit" class="secondary contrast">ยกเลิกใบวางบิล</button>
            </form>
            <form method="POST" action="?/markAsPaid" use:enhance>
                <button type="submit">บันทึกว่าชำระแล้ว</button>
            </form>
        {:else if billingNote.status === 'PAID'}
            <span>ชำระเมื่อ: {new Date(billingNote.paidAt).toLocaleString('th-TH')}</span>
        {:else if billingNote.status === 'CANCELLED'}
            <span><em>ใบวางบิลนี้ถูกยกเลิกแล้ว</em></span>
        {/if}
        <button on:click={() => window.print()}>🖨️ พิมพ์เอกสาร</button>
    </div>
</main>

<style>
    .container { max-width: 900px; margin: 2rem auto; }
    .toolbar { margin-bottom: 1rem; }
    
    .invoice-paper {
        background: white;
        padding: 2.5rem;
        border: 1px solid var(--pico-muted-border-color);
        border-radius: var(--pico-border-radius);
        font-family: 'Sarabun', sans-serif;
    }

    .invoice-header {
        text-align: center;
        margin-bottom: 2rem;
    }
    .invoice-header h1 { margin-bottom: 0.25rem; }
    .invoice-header p { margin: 0; color: var(--pico-muted-color); font-size: 0.9em; }

    .invoice-title {
        text-align: center;
        margin-bottom: 2rem;
    }

    .meta-info {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        margin-bottom: 2rem;
        font-size: 0.9em;
    }
    .invoice-details { text-align: right; }
    .meta-info p { margin: 0.25rem 0; }
    
    .status-tag {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 99px;
        font-size: 0.8em;
        font-weight: bold;
        color: white;
        text-transform: uppercase;
    }
    .status-pending { background-color: #f57c00; }
    .status-paid { background-color: #388e3c; }
    .status-cancelled { background-color: #757575; }

    .items-table table { width: 100%; border-collapse: collapse; font-size: 0.9em; }
    .items-table th, .items-table td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
    .items-table thead { background-color: #f2f2f2; }
    .col-no { width: 5%; text-align: center; }
    .col-date { width: 20%; }
    .col-desc { width: 55%; }
    .col-total { width: 20%; text-align: right; }
    .items-table tfoot td { border: none; padding-top: 1rem; }
    .summary-label { text-align: right; font-weight: bold; }
    .summary-total { text-align: right; font-weight: bold; font-size: 1.2em; border-top: 1px solid #333; border-bottom: 3px double #333; }
    
    .signature-section { display: flex; justify-content: space-around; margin-top: 5rem; font-size: 0.9em; page-break-inside: avoid; }
    .signature-box { text-align: center; }

    .action-footer {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 1rem;
        margin-top: 1.5rem;
    }
    .action-footer form { margin: 0; }

    @media print {
        body { background: white; -webkit-print-color-adjust: exact; }
        .container { max-width: 100%; margin: 0; }
        .toolbar, .action-footer, :global(body > nav) { display: none; }
        .invoice-paper { border: none; box-shadow: none; padding: 0; }
    }
</style>