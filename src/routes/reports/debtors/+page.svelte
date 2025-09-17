<!-- src/routes/reports/debtors/+page.svelte (ปรับปรุงสำหรับ Svelte 5) -->
<script lang="ts">
	import type { PageData } from './$types';

	// [แก้ไข] 1. ใช้ $props() เพื่อรับ data prop
	let { data } = $props<PageData>();

	// [ปรับปรุง] 2. ใช้ $derived เพื่อให้ debtors update อัตโนมัติเมื่อ data เปลี่ยน
	let debtors = $derived(data.debtors || []);
</script>

<svelte:head>
	<title>รายงานลูกหนี้</title>
</svelte:head>

<main class="container">
	<header class="page-header">
		<h1>รายงานลูกหนี้ (ยอดค้างชำระ)</h1>
		<p>แสดงรายการลูกค้าที่มีบิลขายเชื่อคงค้าง</p>
	</header>

	{#if debtors.length === 0}
		<article class="no-debtors">
			<p>✅ ไม่มีลูกหนี้ค้างชำระในขณะนี้</p>
		</article>
	{:else}
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>รหัสสมาชิก</th>
						<th>ชื่อลูกค้า</th>
						<th>เบอร์โทรศัพท์</th>
						<th class="center">จำนวนบิล</th>
						<th class="right">ยอดค้างชำระรวม</th>
						<th class="center">การกระทำ</th>
					</tr>
				</thead>
				<tbody>
					{#each debtors as debtor (debtor.customerId)}
						<tr>
							<td>{debtor.memberCode}</td>
							<td><strong>{debtor.name}</strong></td>
							<td>{debtor.phone}</td>
							<td class="center">{debtor.billCount}</td>
							<td class="right">{debtor.totalDebt.toFixed(2)}</td>
							<td class="center">
								<!-- [แก้ไข] ลิงก์ไปยังหน้าประวัติของลูกค้า -->
								<a href="/customers/{debtor.customerId}/history" role="button" class="outline">ดูประวัติ</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</main>

<style>
	.container {
		max-width: 1100px;
	}
	.page-header {
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--pico-muted-border-color);
	}
	.no-debtors {
		text-align: center;
		padding: 2rem;
		background-color: var(--pico-muted-background-color);
		border-radius: var(--pico-border-radius);
	}
	.table-container {
		overflow-x: auto;
	}
	.center {
		text-align: center;
	}
	.right {
		text-align: right;
	}
</style>

