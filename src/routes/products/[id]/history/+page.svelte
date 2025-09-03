<!-- Path: src/routes/products/[id]/history/+page.svelte (แก้ไขแล้ว) -->
<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	const { product, history } = data;
	// END: แก้ไขชื่อตัวแปร

	// --- State ใหม่สำหรับจัดการการกรอง ---
	type FilterType = 'ALL' | 'PURCHASE_IN' | 'SALE_OUT';
	let activeFilter: FilterType = 'ALL';

	// --- Computed Property สำหรับกรองประวัติ ---
	$: filteredHistory = (() => {
		if (!history) return []; // เพิ่มการป้องกันกรณี history เป็น null/undefined
		if (activeFilter === 'ALL') {
			return history;
		}
		return history.filter((item) => item.type === activeFilter);
	})();

	// ฟังก์ชันสำหรับแปลงประเภทการเคลื่อนไหวเป็นข้อความภาษาไทย
	function formatMovementType(type: string) {
		switch (type) {
			case 'PURCHASE_IN':
				return { text: 'รับเข้า (ซื้อ)', class: 'status-in' };
			case 'SALE_OUT':
				return { text: 'ขายออก', class: 'status-out' };
			case 'RETURN_IN':
				return { text: 'รับคืน', class: 'status-return' };
			case 'ADJUST_ADD':
				return { text: 'ปรับสต็อก (เพิ่ม)', class: 'status-adjust' };
			case 'ADJUST_SUB':
				return { text: 'ปรับสต็อก (ลด)', class: 'status-adjust' };
			default:
				return { text: type, class: '' };
		}
	}

	// ฟังก์ชันสำหรับจัดรูปแบบวันที่
	function formatDate(dateString: Date) {
		return new Date(dateString).toLocaleString('th-TH', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<main class="container">
	<article>
		<header class="page-header">
			<div>
				<h1>ประวัติสินค้า</h1>
				<p class="sub-header">
					<strong>{product.name}</strong> (บาร์โค้ด: {product.barcode || '-'})
				</p>
			</div>
			<a href="/products" role="button" class="secondary"> &laquo; กลับไปหน้ารายการสินค้า </a>
		</header>

		<!-- START: เพิ่มส่วนของปุ่มกรอง -->
		<div class="filter-controls" role="group">
			<button class:active={activeFilter === 'ALL'} on:click={() => (activeFilter = 'ALL')}>
				ดูทั้งหมด
			</button>
			<button class:active={activeFilter === 'PURCHASE_IN'} on:click={() => (activeFilter = 'PURCHASE_IN')}>
				ประวัติรับเข้า
			</button>
			<button class:active={activeFilter === 'SALE_OUT'} on:click={() => (activeFilter = 'SALE_OUT')}>
				ประวัติขายออก
			</button>
		</div>
		<!-- END: เพิ่มส่วนของปุ่มกรอง -->

		{#if !filteredHistory || filteredHistory.length === 0}
			<p>
				{#if activeFilter === 'ALL'}
					ยังไม่มีประวัติการเคลื่อนไหวสำหรับสินค้าชิ้นนี้
				{:else}
					ไม่พบข้อมูลประวัติประเภทนี้
				{/if}
			</p>
		{:else}
			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th style="width: 25%;">วันที่</th>
							<th style="width: 25%;">ประเภท</th>
							<th style="text-align: right;">จำนวนที่เปลี่ยน</th>
							<th style="text-align: right;">สต็อกคงเหลือ</th>
							<th style="text-align: right;">ต้นทุน/ราคา</th>
							<th>หมายเหตุ</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredHistory as item (item.id)}
							<tr>
								<td>{formatDate(item.createdAt)}</td>
								<td>
									<span class="status-badge {formatMovementType(item.type).class}">
										{formatMovementType(item.type).text}
									</span>
								</td>
								<td class="quantity-change {item.quantityChange > 0 ? 'positive' : 'negative'}">
									{item.quantityChange > 0 ? '+' : ''}{item.quantityChange}
								</td>
								<td style="text-align: right;">{item.newStockQuantity}</td>
								<td style="text-align: right;">
									{#if item.type === 'PURCHASE_IN'}
										{item.costAtTime?.toFixed(2) ?? '-'} (ทุน)
									{:else if item.type === 'SALE_OUT'}
										{item.priceAtTime?.toFixed(2) ?? '-'} (ราคาขาย)
									{:else}
										-
									{/if}
								</td>
								<td>{item.notes || '-'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</article>
</main>

<style>
	.container {
		max-width: 1100px;
		margin: 2rem auto;
	}
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		border-bottom: 1px solid var(--pico-muted-border-color);
		padding-bottom: 1rem;
	}
	.page-header h1,
	.page-header p {
		margin: 0;
	}
	.sub-header {
		color: var(--pico-secondary);
		font-size: 1.1rem;
		margin-top: 0.25rem;
	}

	/* START: สไตล์สำหรับปุ่มกรอง */
	.filter-controls {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		border: 1px solid var(--pico-form-element-border-color);
		border-radius: var(--pico-border-radius);
		padding: 0.25rem;
		width: max-content;
	}
	.filter-controls button {
		border: none;
		background-color: transparent;
		padding: 0.5rem 1rem;
		border-radius: calc(var(--pico-border-radius) - 2px);
		cursor: pointer;
		font-weight: 500;
		color: var(--pico-secondary);
	}
	.filter-controls button:hover {
		background-color: var(--pico-muted-background-color);
	}
	.filter-controls button.active {
		background-color: var(--pico-primary);
		color: var(--pico-primary-inverse);
	}
	/* END: สไตล์สำหรับปุ่มกรอง */

	.table-container {
		overflow-x: auto;
	}
	.status-badge {
		padding: 0.25rem 0.6rem;
		border-radius: 999px;
		font-size: 0.8rem;
		font-weight: 600;
		color: #fff;
		white-space: nowrap;
	}
	.status-badge.status-in {
		background-color: #28a745;
	}
	.status-badge.status-out {
		background-color: #dc3545;
	}
	.status-badge.status-return {
		background-color: #ffc107;
		color: #000;
	}
	.status-badge.status-adjust {
		background-color: #6c757d;
	}
	.quantity-change {
		text-align: right;
		font-weight: bold;
	}
	.quantity-change.positive {
		color: var(--pico-color-green-500);
	}
	.quantity-change.negative {
		color: var(--pico-color-red-600);
	}
</style>

