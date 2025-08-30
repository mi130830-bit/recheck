<!-- Path: src/routes/reports/debtors/+page.svelte (Final Corrected Version) -->

<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<svelte:head>
	<title>รายงานลูกหนี้</title>
</svelte:head>

<main class="container">
	<header>
		<h1>รายงานลูกหนี้ (ยอดค้างชำระ)</h1>
		<p>แสดงรายการลูกค้าที่มีบิลขายเชื่อคงค้าง</p>
	</header>

	{#if data.debtors.length === 0}
		<article>
			<p>✅ ไม่มีลูกหนี้ค้างชำระในขณะนี้</p>
		</article>
	{:else}
		<table>
			<thead>
				<tr>
					<th>รหัสสมาชิก</th>
					<th>ชื่อลูกค้า</th>
					<th>เบอร์โทรศัพท์</th>
					<th style="text-align: center;">จำนวนบิล</th>
					<th style="text-align: right;">ยอดค้างชำระรวม</th>
					<th>การกระทำ</th>
				</tr>
			</thead>
			<tbody>
				{#each data.debtors as debtor (debtor.customerId)}
					<tr>
						<td>{debtor.memberCode}</td>
						<!-- [แก้ไข] แสดงชื่อลูกค้า -->
						<td><strong>{debtor.name}</strong></td> 
						<td>{debtor.phone}</td>
						<td style="text-align: center;">{debtor.billCount}</td>
						<td style="text-align: right;">{debtor.totalDebt.toFixed(2)}</td>
						<td>
							<!-- [แก้ไข] แก้ไขลิงก์ให้ถูกต้อง -->
							<a href="/reports/debtors/{debtor.customerId}" role="button" class="outline">ดูรายละเอียด</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</main>

<style>
	.container {
		max-width: 960px;
		margin: 2rem auto;
	}
</style>