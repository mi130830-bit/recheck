<!-- Path: src/routes/reports/debtors/+page.svelte (ฉบับแก้ไข) -->

<script lang="ts">
	export let data;
</script>

<div class="container">
	<header>
		<h1>รายงานลูกหนี้ (ยอดค้างชำระ)</h1>
		<p>แสดงรายการลูกค้าที่มีบิลขายเชื่อคงค้าง</p>
	</header>

	{#if data.debtors.length === 0}
		<article>
			<p>🎉 ยอดเยี่ยม! ไม่มีลูกหนี้ค้างชำระในระบบ</p>
		</article>
	{:else}
		<figure>
			<table>
				<thead>
					<tr>
						<th>รหัสสมาชิก</th>
						<th>ชื่อลูกค้า</th>
						<th>เบอร์โทรศัพท์</th>
						<th style="text-align: center;">จำนวนบิล</th>
						<th style="text-align: right;">ยอดค้างชำระรวม</th>
						<th style="text-align: center;">การกระทำ</th>
					</tr>
				</thead>
				<tbody>
					{#each data.debtors as debtor (debtor.id)}
						<tr>
							<td>{debtor.memberCode}</td>
							<td>{debtor.name}</td>
							<td>{debtor.phone || '-'}</td>
							<td style="text-align: center;">{debtor.billCount}</td>
							<td style="text-align: right;">{debtor.totalDebt.toFixed(2)}</td>
							<td style="text-align: center;">
								<!-- [เพิ่มใหม่] ปุ่มดูรายละเอียด -->
								<a href="/reports/debtors/{debtor.id}" role="button" class="outline">ดูรายละเอียด</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</figure>
	{/if}
</div>

<style>
	.container {
		max-width: 960px;
		margin: 2rem auto;
	}
	header {
		margin-bottom: 2rem;
		text-align: center;
	}
</style>