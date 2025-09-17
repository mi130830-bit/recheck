<!-- src/routes/receipts/[orderId]/+page.svelte (แก้ไขแล้ว) -->
<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	// [แก้ไข] 1. ใช้ $props() เพื่อรับข้อมูลตามมาตรฐาน Svelte 5 (แก้ Error แรก)
	let { receiptData } = $props<PageData>();
	
	// [แก้ไข] 2. ใช้ $derived พร้อมค่าเริ่มต้น {} เพื่อป้องกัน TypeError (แก้ Error ที่สอง)
	// ถ้า receiptData เป็น null, `order` และ `shopInfo` จะเป็น undefined โดยไม่เกิด Error
	let { order, shopInfo } = $derived(receiptData || {});

	// [ปรับปรุง] ใช้ $state และ $effect เพื่อจัดการขนาดกระดาษให้ Sync กับ URL
	let paperSize = $state($page.url.searchParams.get('size') || 'slip');

	$effect(() => {
		const url = new URL($page.url);
		url.searchParams.set('size', paperSize);
		// ใช้ replaceState เพื่อเปลี่ยน URL โดยไม่สร้างประวัติใหม่ (no history entry)
		goto(url, { replaceState: true, keepFocus: true, noScroll: true });
	});

	function handlePrint() {
		window.print();
	}
</script>

<!-- [ปรับปรุง] 3. ใช้ #if order เพื่อควบคุมการแสดงผลทั้งหมด -->
{#if order}
	<div class="page-container">
		<!-- ส่วนควบคุมการพิมพ์ (นอกขอบเขตกระดาษ) -->
		<div class="print-controls no-print">
			<div class="control-row">
				<div class="page-size-selector">
					<label>
						<input type="radio" name="size" value="slip" bind:group={paperSize} /> 80mm
					</label>
					<label>
						<input type="radio" name="size" value="a5" bind:group={paperSize} /> A5
					</label>
					<label>
						<input type="radio" name="size" value="a4" bind:group={paperSize} /> A4
					</label>
				</div>
				<button on:click={handlePrint} class="print-button">🖨️ พิมพ์</button>
			</div>
		</div>

		<!-- ส่วนของใบเสร็จ (ที่จะถูกพิมพ์) -->
		<div class="receipt" class:a4={paperSize === 'a4'} class:a5={paperSize === 'a5'} class:slip={paperSize === 'slip'}>
			<header class="receipt-header">
				{#if shopInfo?.receiptLogoUrl}
					<img src={shopInfo.receiptLogoUrl} alt="logo" class="logo" />
				{/if}
				<h1>{shopInfo?.storeName || 'My POS Store'}</h1>
				<p>{shopInfo?.address || ''}</p>
				<p>โทร. {shopInfo?.phone || ''} | เลขประจำตัวผู้เสียภาษี: {shopInfo?.taxId || ''}</p>
				
				<div class="order-details">
					<div><strong>เลขที่:</strong> {order.orderNumber}</div>
					<div>
						<strong>วันที่:</strong>
						{new Date(order.createdAt).toLocaleString('th-TH', {
							year: '2-digit', month: '2-digit', day: '2-digit',
							hour: '2-digit', minute: '2-digit'
						})}
					</div>
					{#if order.customer}
						<div><strong>ลูกค้า:</strong> {order.customer.firstName} {order.customer.lastName || ''}</div>
					{/if}
				</div>
			</header>

			<table class="items-table">
				<thead>
					<tr>
						<th>รายการ</th>
						<th class="center">จำนวน</th>
						<th class="right">ราคา</th>
						<th class="right">รวม</th>
					</tr>
				</thead>
				<tbody>
					{#each order.items as item (item.id)}
						<tr>
							<td>{item.product.name}</td>
							<td class="center">{item.quantity}</td>
							<td class="right">{item.price.toFixed(2)}</td>
							<td class="right">{item.total.toFixed(2)}</td>
						</tr>
					{/each}
				</tbody>
			</table>

			<section class="summary">
				<hr class="dashed" />
				<div class="summary-row">
					<span>รวมเป็นเงิน</span>
					<strong>{order.total.toFixed(2)}</strong>
				</div>
				{#if order.received}
					<div class="summary-row">
						<span>รับเงิน</span>
						<span>{order.received.toFixed(2)}</span>
					</div>
				{/if}
				{#if order.change}
					<div class="summary-row">
						<span>เงินทอน</span>
						<span>{order.change.toFixed(2)}</span>
					</div>
				{/if}
			</section>

			<footer class="receipt-footer">
				<hr class="dashed" />
				<p>{shopInfo?.receiptNote || 'ขอบคุณที่ใช้บริการ'}</p>
			</footer>
		</div>
	</div>
{:else}
	<!-- ส่วนที่จะแสดงผลเมื่อ Server หา order ไม่เจอ -->
	<div class="page-container">
		<article class="not-found-card">
			<header>ไม่พบข้อมูล</header>
			<p>ไม่พบข้อมูลบิลที่คุณต้องการ (ID: {$page.params.orderId})</p>
			<a href="/orders" role="button" class="secondary">กลับไปหน้ารายการบิล</a>
		</article>
	</div>
{/if}

<style>
	/* Styles for screen preview */
	.page-container {
		background-color: #f0f2f5;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem 1rem;
		min-height: 100vh;
	}
	.receipt {
		background-color: white;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
		color: #000;
		border: 1px solid #ddd;
	}
	.not-found-card {
		max-width: 500px;
		text-align: center;
	}

	/* Print Controls */
	.print-controls {
		width: 100%;
		max-width: 210mm; /* A4 width */
		margin-bottom: 2rem;
		padding: 1rem;
		background-color: #fff;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
	.control-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.page-size-selector { display: flex; gap: 1rem; }
	.page-size-selector label { margin: 0; }
	.print-button {
		--pico-font-size: 1rem;
		--pico-padding: 0.5rem 1.25rem;
	}

	/* Paper size styles */
	.slip { width: 72mm; padding: 12px 8px; font-family: 'Courier New', monospace; font-size: 10pt; }
	.a5 { width: 148mm; min-height: 210mm; padding: 10mm; font-family: Arial, sans-serif; font-size: 10pt; }
	.a4 { width: 210mm; min-height: 297mm; padding: 15mm; font-family: Arial, sans-serif; font-size: 12pt; }

	/* General receipt styles */
	.receipt-header { text-align: center; }
	.logo { max-width: 60%; max-height: 80px; margin-bottom: 0.5rem; }
	h1 { font-size: 1.4em; margin:0; }
	.receipt-header p { margin: 4px 0; font-size: 0.9em; }
	.order-details {
		text-align: left;
		font-size: 0.9em;
		margin-top: 1rem;
		padding-top: 0.75rem;
		border-top: 1px dashed #333;
	}
	.items-table { width: 100%; border-collapse: collapse; font-size: 0.95em; margin: 1rem 0; }
	.items-table thead { border-top: 1px solid #333; border-bottom: 1px solid #333; }
	.items-table th, .items-table td { padding: 6px 2px; }
	.center { text-align: center; }
	.right { text-align: right; }
	.summary { margin-top: 0.5rem; }
	.summary-row { display: flex; justify-content: space-between; font-size: 1em; margin: 0.4rem 0; }
	hr.dashed { border: none; border-top: 1px dashed #333; margin: 0.75rem 0; }
	.receipt-footer { text-align: center; margin-top: 1rem; font-size: 0.9em; }

	/* Print-specific styles */
	@media print {
		body, .page-container { background: white; }
		.page-container { padding: 0; }
		.no-print, .print-controls { display: none !important; }
		.receipt { width: 100%; min-height: 0; box-shadow: none; border: none; margin: 0; padding: 0; }
	}
	@page {
		margin: 0.5cm;
	}
</style>

