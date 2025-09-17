<!-- src/routes/delivery-note/[id]/+page.svelte (ปรับปรุงใหม่ทั้งหมด) -->
<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	// [แก้ไข] 1. ใช้ $props() เพื่อรับข้อมูลตามมาตรฐาน Svelte 5
	let { data } = $props<PageData>();

	// [แก้ไข] 2. ใช้ $derived พร้อมค่าเริ่มต้น {} เพื่อป้องกัน TypeError หากหาบิลไม่เจอ
	let { order, shopInfo } = $derived(data.deliveryData || {});

	// [ปรับปรุง] 3. ใช้ $state และ $effect เพื่อจัดการขนาดกระดาษ
	let paperSize = $state($page.url.searchParams.get('size') || 'a4');

	$effect(() => {
		const url = new URL($page.url);
		url.searchParams.set('size', paperSize);
		goto(url, { replaceState: true, keepFocus: true, noScroll: true });
	});

	onMount(() => {
		// หน่วงเวลาเล็กน้อยเพื่อให้ Svelte render เสร็จก่อนสั่งพิมพ์
		setTimeout(() => {
			window.print();
		}, 300);
	});
</script>

<svelte:head>
	{#if order}
		<title>ใบส่งของ #{order.orderNumber}</title>
	{:else}
		<title>ไม่พบข้อมูล</title>
	{/if}
</svelte:head>

<!-- [ปรับปรุง] 4. ใช้ #if order เพื่อควบคุมการแสดงผลทั้งหมด -->
{#if order}
	<div class="page-container">
		<!-- ส่วนควบคุม (นอกขอบเขตกระดาษ) -->
		<div class="print-controls no-print">
			<div class="page-size-selector">
				<span>ขนาดกระดาษ:</span>
				<label> <input type="radio" name="size" value="a4" bind:group={paperSize} /> A4 </label>
				<label> <input type="radio" name="size" value="a5" bind:group={paperSize} /> A5 </label>
			</div>
			<button onclick={() => window.print()}>🖨️ พิมพ์อีกครั้ง</button>
		</div>

		<!-- ส่วนของเอกสาร (ที่จะถูกพิมพ์) -->
		<div class="document-paper" class:a4={paperSize === 'a4'} class:a5={paperSize === 'a5'}>
			<header class="doc-header">
				<div class="shop-info">
					<h2>{shopInfo?.name || 'ชื่อร้านค้า'}</h2>
					<p>{shopInfo?.address || 'ที่อยู่ร้านค้า'}</p>
					<p>โทร: {shopInfo?.phone || ''} | เลขประจำตัวผู้เสียภาษี: {shopInfo?.taxId || ''}</p>
				</div>
				<div class="doc-details">
					<h1>ใบส่งของ</h1>
					<p><strong>เลขที่:</strong> {order.orderNumber}</p>
					<p><strong>วันที่:</strong> {new Date(order.createdAt).toLocaleDateString('th-TH', { dateStyle: 'long' })}</p>
				</div>
			</header>

			<section class="customer-info">
				<h3>ข้อมูลลูกค้า</h3>
				<p><strong>ชื่อ:</strong> {order.customer?.firstName || 'ลูกค้าทั่วไป'} {order.customer?.lastName || ''}</p>
				<p><strong>ที่อยู่:</strong> {order.customer?.address || '-'}</p>
				<p><strong>โทรศัพท์:</strong> {order.customer?.phone || '-'}</p>
			</section>

			<section class="items-table">
				<table>
					<thead>
						<tr>
							<th class="col-no">#</th>
							<th class="col-desc">รายการ</th>
							<th class="col-qty">จำนวน</th>
						</tr>
					</thead>
					<tbody>
						{#each order.items as item, i}
							<tr>
								<td class="col-no">{i + 1}</td>
								<td class="col-desc">{item.product.name}</td>
								<td class="col-qty">{item.quantity} {item.product.unit?.name || 'หน่วย'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</section>

			<footer class="signature-section">
				<div class="signature-box">
					<p>........................................</p>
					<p>(ผู้ส่งสินค้า)</p>
				</div>
				<div class="signature-box">
					<p>........................................</p>
					<p>(ผู้รับสินค้า)</p>
					<p>วันที่: ......./......./.........</p>
				</div>
			</footer>
		</div>
	</div>
{:else}
	<!-- แสดงผลเมื่อหาบิลไม่เจอ -->
	<main class="container">
		<article style="text-align: center; margin-top: 4rem;">
			<header>
				<h2>ไม่พบข้อมูล</h2>
			</header>
			<p>ไม่พบข้อมูลใบส่งของที่คุณกำลังค้นหา (ID: {$page.params.id})</p>
			<footer>
				<a href="/orders" role="button">กลับไปที่รายการบิลทั้งหมด</a>
			</footer>
		</article>
	</main>
{/if}

<style>
	/* Styles for screen preview */
	.page-container {
		background-color: #e9ecef;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem 1rem;
		min-height: 100vh;
	}
	.document-paper {
		background-color: white;
		box-shadow: 0 0 15px rgba(0, 0, 0, 0.15);
		color: #000;
	}
	.print-controls {
		width: 100%;
		max-width: 210mm; /* A4 width */
		margin-bottom: 2rem;
		padding: 1rem;
		background-color: #fff;
		border-radius: 8px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	/* Paper size styles */
	.a4 { width: 210mm; min-height: 297mm; padding: 15mm; font-size: 12pt; }
	.a5 { width: 148mm; min-height: 210mm; padding: 10mm; font-size: 10pt; }

	/* General document styles */
	.doc-header {
		display: flex;
		justify-content: space-between;
		border-bottom: 2px solid #333;
		padding-bottom: 15px;
		margin-bottom: 20px;
	}
	.doc-header h2 { margin: 0; }
	.doc-header p { margin: 4px 0; font-size: 0.9em; }
	.doc-details { text-align: right; }
	.doc-details h1 { margin: 0 0 10px 0; font-size: 1.5em; color: #333; }
	.customer-info { margin-bottom: 20px; }
	.customer-info h3 { margin-top: 0; }
	.customer-info p { margin: 5px 0; }
	table { width: 100%; border-collapse: collapse; }
	th, td { padding: 8px 10px; border: 1px solid #ccc; }
	thead { background-color: #f2f2f2; }
	.col-no { width: 10%; text-align: center; }
	.col-desc { width: 70%; }
	.col-qty { width: 20%; text-align: center; }
	.signature-section { display: flex; justify-content: space-around; margin-top: 5rem; page-break-inside: avoid; }
	.signature-box { text-align: center; }

	/* Print-specific styles */
	@media print {
		body, .page-container { background: white; }
		.page-container { padding: 0; }
		.no-print { display: none !important; }
		.document-paper { width: 100%; min-height: 0; box-shadow: none; border: none; margin: 0; padding: 0; }
	}
	@page { margin: 0.75in; }
</style>

