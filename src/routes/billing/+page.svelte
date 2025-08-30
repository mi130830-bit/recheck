<!-- Path: src/routes/billing/+page.svelte (Final Working Version) -->

<script lang="ts">
    import type { PageData } from './$types';
    export let data: PageData;
</script>

<svelte:head>
    <title>รายการใบวางบิล</title>
</svelte:head>

<main class="container">
    <header class="header-container">
        <h1>รายการใบวางบิลทั้งหมด</h1>
    </header>

    {#if data.billingNotes.length === 0}
        <article>
            <p>ยังไม่มีข้อมูลใบวางบิลในระบบ</p>
        </article>
    {:else}
        <div style="overflow-x: auto;">
            <table>
                <thead>
                    <tr>
                        <th>เลขที่ใบวางบิล</th>
                        <th>ลูกค้า</th>
                        <th style="text-align: right;">ยอดรวม</th>
                        <th>วันที่สร้าง</th>
                        <th>การกระทำ</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.billingNotes as bn (bn.id)}
                        <tr>
                            <td><strong>{bn.bnNumber}</strong></td>
                            <td>{bn.customer.firstName} {bn.customer.lastName || ''}</td>
                            <td style="text-align: right;">{bn.totalAmount.toFixed(2)}</td>
                            <td>{new Date(bn.createdAt).toLocaleDateString('th-TH')}</td>
                            <td>
                                <a href="/billing/{bn.id}" role="button" class="outline">ดูรายละเอียด</a>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</main>

<style>
  .container { max-width: 960px; margin: 2rem auto; }
  .header-container { margin-bottom: 2rem; }
</style>