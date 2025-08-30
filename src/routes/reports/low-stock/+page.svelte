<!-- Path: src/routes/reports/low-stock/+page.svelte (Final Corrected Version) -->

<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: lowStockProducts = data.lowStockProducts;
</script>

<svelte:head>
	<title>รายงานสินค้าใกล้หมด</title>
</svelte:head>

<main class="container">
	<h1>รายงานสินค้าใกล้หมด</h1>

	{#if lowStockProducts.length === 0}
		<article>
			<p>✅ ยอดเยี่ยม! ไม่มีสินค้าที่ใกล้หมดสต็อกในขณะนี้</p>
		</article>
	{:else}
		<div style="overflow-x: auto;">
			<table>
				<thead>
					<tr>
						<th>ชื่อสินค้า</th>
						<th>บาร์โค้ด</th>
						<th style="text-align: center;">คงเหลือ</th>
						<th style="text-align: center;">จุดสั่งซื้อ</th>
						<th>ผู้ขาย</th>
					</tr>
				</thead>
				<tbody>
					{#each lowStockProducts as product (product.id)}
						<tr>
							<td>{product.name}</td>
							<td>{product.barcode || '-'}</td>
							<td style="text-align: center; color: var(--pico-color-red-500);">
								<strong>{product.stockQuantity}</strong>
							</td>
							<td style="text-align: center;">{product.reorderPoint}</td>
							<!-- [จุดแก้ไขสำคัญ] ใช้ Optional Chaining (?.) เพื่อป้องกัน Error -->
							<!-- บรรทัดนี้คือบรรทัดที่ 35 ของคุณ -->
							<td>{product.supplier?.name || 'ไม่มีข้อมูล'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</main>

<style>
	.container {
		max-width: 960px;
		margin: 2rem auto;
	}
</style>