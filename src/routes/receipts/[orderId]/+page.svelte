<!-- Path: src/routes/receipts/[orderId]/+page.svelte (Final Corrected Version) -->
<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	const { receiptData } = data;
	const { order, shopInfo } = receiptData;

	const paperSize = $page.url.searchParams.get('size') || 'slip';

	onMount(() => {
		setTimeout(() => {
			window.print();
		}, 300);
	});
</script>

<svelte:head>
	<title>ใบเสร็จรับเงิน #{order.orderNumber}</title>
</svelte:head>

<div class="receipt-container" class:a4={paperSize === 'a4'} class:a5={paperSize === 'a5'} class:slip={paperSize === 'slip'}>
	<header>
		<h1>ใบเสร็จรับเงิน / ใบกำกับภาษีอย่างย่อ</h1>
		<h2>{shopInfo.name}</h2>
		<p>{shopInfo.address}</p>
		<p>โทร. {shopInfo.phone} | เลขประจำตัวผู้เสียภาษี: {shopInfo.taxId}</p>
	</header>

	<section class="meta-info">
		<div><strong>เลขที่:</strong> {order.orderNumber}</div>
		<div><strong>วันที่:</strong> {new Date(order.createdAt).toLocaleString('th-TH')}</div>
		<div><strong>ลูกค้า:</strong> {order.customer?.firstName || 'ลูกค้าทั่วไป'}</div>
	</section>

	<main>
		<table>
			<thead>
				<tr>
					<th>#</th>
					<th class="item-name">รายการ</th>
					<th>จำนวน</th>
					<th>หน่วยละ</th>
					<th>รวม</th>
				</tr>
			</thead>
			<tbody>
				{#each order.items as item, i}
					<tr>
						<td>{i + 1}</td>
						<td class="item-name">{item.product.name}</td>
						<td class="num">{item.quantity}</td>
						<!-- [แก้ไข] แปลง String เป็น Number ก่อนใช้ toFixed -->
						<td class="num">{Number(item.price).toFixed(2)}</td>
						<!-- [แก้ไข] แปลง String เป็น Number ก่อนนำไปคำนวณ -->
						<td class="num">{(item.quantity * Number(item.price)).toFixed(2)}</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<td colspan="4" class="total-label">รวมเป็นเงิน</td>
					<!-- [แก้ไข] แปลง String เป็น Number ก่อนใช้ toFixed -->
					<td class="num total-value">{Number(order.total).toFixed(2)}</td>
				</tr>
			</tfoot>
		</table>
	</main>

	<footer>
		<p>ขอบคุณที่ใช้บริการ</p>
	</footer>
</div>

<style>
	/* --- General Styles --- */
	:global(body) {
		background-color: #f0f0f0;
	}
	.receipt-container {
		background-color: white;
		margin: 20px auto;
		padding: 20px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		font-family: 'Sarabun', sans-serif;
	}
	header, footer { text-align: center; }
	h1 { font-size: 1.2em; margin: 0; }
	h2 { font-size: 1.1em; margin: 5px 0; }
	p { margin: 2px 0; font-size: 0.9em; }
	.meta-info {
		display: flex;
		justify-content: space-between;
		margin: 15px 0;
		border-top: 1px dashed #333;
		border-bottom: 1px dashed #333;
		padding: 5px 0;
	}
	table { width: 100%; border-collapse: collapse; margin-top: 10px; }
	th, td { padding: 5px; }
	thead { border-bottom: 1px solid #333; }
	tfoot { border-top: 1px solid #333; }
	.item-name { text-align: left; }
	.num { text-align: right; }
	.total-label { text-align: right; font-weight: bold; }
	.total-value { font-weight: bold; font-size: 1.1em; }

	/* --- Size-Specific Styles --- */
	.slip {
		width: 80mm;
		padding: 5mm;
		font-size: 12px;
	}
	.a5 {
		width: 148mm;
		height: 210mm;
	}
	.a4 {
		width: 210mm;
		height: 297mm;
	}

	/* --- Print-Specific Styles --- */
	@media print {
		:global(body) {
			background-color: white;
		}
		.receipt-container {
			margin: 0;
			padding: 0;
			box-shadow: none;
		}
		.a4, .a5 {
			position: absolute;
			top: 0;
			left: 0;
		}
	}
</style>