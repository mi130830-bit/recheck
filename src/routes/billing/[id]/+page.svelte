<!-- Path: src/routes/billing/[id]/+page.svelte -->

<script lang="ts">
    export let data;
    const { billingNote, companyInfo } = data;
</script>

<div class="toolbar no-print">
    <a href="/reports/debtors/{billingNote.customerId}" role="button" class="secondary outline">&larr; กลับไปหน้ารายละเอียดลูกหนี้</a>
    <button on:click={() => window.print()}>🖨️ พิมพ์เอกสาร</button>
</div>

<div class="invoice-container">
    <header>
        <div class="company-info">
            <h1>{companyInfo.name}</h1>
            <p>{companyInfo.address}</p>
            <p>เลขประจำตัวผู้เสียภาษี: {companyInfo.taxId} | โทร: {companyInfo.phone}</p>
        </div>
        <div class="invoice-title">
            <h2>ใบวางบิล / BILLING NOTE</h2>
        </div>
    </header>

    <section class="customer-info">
        <div class="details">
            <p><strong>ลูกค้า:</strong> {billingNote.customer.name}</p>
            <p><strong>ที่อยู่:</strong> {billingNote.customer.address || '-'}</p>
        </div>
        <div class="meta">
            <p><strong>เลขที่:</strong> {billingNote.bnNumber}</p>
            <p><strong>วันที่:</strong> {new Date(billingNote.createdAt).toLocaleDateString('th-TH')}</p>
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
                        <td class="col-desc">{item.order.orderNumber}</td>
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
</div>

<style>
    /* A4 paper layout and print styles */
    .invoice-container {
        width: 210mm;
        min-height: 297mm;
        margin: 2rem auto;
        padding: 15mm;
        background: white;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        box-sizing: border-box;
        font-family: 'Sarabun', sans-serif; /* แนะนำให้ใช้ฟอนต์ไทย */
        color: #333;
    }

    header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 2px solid #333;
        padding-bottom: 1rem;
        margin-bottom: 1.5rem;
    }
    .company-info h1 { font-size: 1.5em; margin-bottom: 0.5rem; }
    .company-info p { margin: 0; font-size: 0.9em; }
    .invoice-title { text-align: right; }
    .invoice-title h2 { font-size: 1.8em; margin: 0; }
    
    .customer-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 2rem;
        font-size: 0.9em;
        padding: 1rem;
        border: 1px solid #ccc;
        border-radius: 5px;
    }
    .customer-info p { margin: 0.25rem 0; }

    .items-table table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9em;
    }
    .items-table th, .items-table td {
        border: 1px solid #ccc;
        padding: 0.5rem;
        text-align: left;
    }
    .items-table thead {
        background-color: #f2f2f2;
    }
    .col-no { width: 5%; text-align: center; }
    .col-date { width: 20%; }
    .col-desc { width: 55%; }
    .col-total { width: 20%; text-align: right; }
    
    .items-table tfoot td {
        border: none;
        padding-top: 1rem;
    }
    .summary-label {
        text-align: right;
        font-weight: bold;
    }
    .summary-total {
        text-align: right;
        font-weight: bold;
        font-size: 1.2em;
        border-top: 1px solid #333;
        border-bottom: 3px double #333;
    }
    
    .signature-section {
        display: flex;
        justify-content: space-around;
        margin-top: 5rem;
        font-size: 0.9em;
    }
    .signature-box {
        text-align: center;
    }

    /* Print-specific styles */
    .toolbar {
        text-align: center;
        margin: 2rem;
        display: flex;
        justify-content: center;
        gap: 1rem;
    }
    @media print {
        body { background: white; -webkit-print-color-adjust: exact; }
        .no-print, .main-header { display: none; }
        .invoice-container { margin: 0; box-shadow: none; border: none; }
    }
</style>