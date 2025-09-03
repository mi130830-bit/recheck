<!-- Path: src/routes/receipts/[orderId]/+page.svelte (Final with Print Controls) -->
<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	const { receiptData } = data;
	const { order, shopInfo } = receiptData;

	// --- START: ส่วนควบคุมการพิมพ์ ---
	let paperSize: 'slip' | 'a5' | 'a4' = 'slip'; // ค่าเริ่มต้นเป็น 80mm (slip)

	function printReceipt() {
		// ใช้ setTimeout เพื่อให้แน่ใจว่า Svelte ได้อัปเดต class ของ paperSize ใน DOM แล้ว
		setTimeout(() => {
			window.print();
		}, 50);
	}
	// --- END: ส่วนควบคุมการพิมพ์ ---
</script>

<svelte:head>
	<title>ใบเสร็จรับเงิน #{order.orderNumber}</title>
</svelte:head>

<!-- START: UI ส่วนควบคุมการพิมพ์ (จะถูกซ่อนตอนพิมพ์) -->
<div class="print-controls">
	<div class="container">
		<a href="/customers/{order.customerId}/history" role="button" class="secondary outline">
			&laquo; กลับไปประวัติ
		</a>
		<div class="button-group">
			<button class:outline={paperSize !== 'slip'} on:click={() => (paperSize = 'slip')}>
				80มม.
			</button>
			<button class:outline={paperSize !== 'a5'} on:click={() => (paperSize = 'a5')}>A5</button>
			<button class:outline={paperSize !== 'a4'} on:click={() => (paperSize = 'a4')}>A4</button>
		</div>
		<button on:click={printReceipt}>
			🖨️ พิมพ์ใบเสร็จ
		</button>
	</div>
</div>
<!-- END: UI ส่วนควบคุมการพิมพ์ -->

<!-- ใช้ `paperSize` ที่เป็น state มากำหนด class ที่นี่ -->
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
						<td class="num">{item.price.toFixed(2)}</td>
						<td class="num">{(item.quantity * item.price).toFixed(2)}</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<td colspan="4" class="total-label">รวมเป็นเงิน</td>
					<td class="num total-value">{order.total.toFixed(2)}</td>
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
		/* เพิ่ม padding-top เพื่อไม่ให้ control bar ทับเนื้อหา */
		padding-top: 80px; 
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
	}
	.a4 {
		width: 210mm;
	}
	
	/* --- START: Styles for Print Controls --- */
	.print-controls {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		background-color: #ffffff;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		padding: 1rem 0;
		z-index: 1000;
	}
	.print-controls .container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}
	.button-group {
		display: flex;
	}
	.button-group button {
		margin: 0;
		border-radius: 0;
	}
	.button-group button:first-child {
		border-top-left-radius: var(--pico-border-radius);
		border-bottom-left-radius: var(--pico-border-radius);
	}
	.button-group button:last-child {
		border-top-right-radius: var(--pico-border-radius);
		border-bottom-right-radius: var(--pico-border-radius);
	}
	/* --- END: Styles for Print Controls --- */


	/* --- Print-Specific Styles --- */
	@media print {
		:global(body) {
			background-color: white;
			padding-top: 0; /* เอา padding ออกเมื่อพิมพ์ */
		}
		
		/* ซ่อนแถบควบคุมทั้งหมดเมื่อสั่งพิมพ์ */
		.print-controls {
			display: none;
		}

		.receipt-container {
			margin: 0;
			padding: 0;
			box-shadow: none;
			border: none;
		}
		.a4, .a5, .slip {
			width: 100%; /* ให้เต็มความกว้างของกระดาษที่เลือกใน dialog พิมพ์ */
			position: absolute;
			top: 0;
			left: 0;
		}
	}
</style>