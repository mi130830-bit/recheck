<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	// สมมติว่า PageData มีข้อมูลตามนี้ (ต้องไปกำหนดใน +page.ts หรือ +page.server.ts)
	// export let data: PageData;
	// const { deliveryData } = data;
	// const { order, shopInfo } = deliveryData;

	// === ใช้ข้อมูลตัวอย่างเพื่อแสดงผลชั่วคราว ===
	const shopInfo = {
		name: 'ร้าน PJ POS',
		address: '123/45 ถนนสุขุมวิท แขวงบางนา เขตบางนา กรุงเทพฯ 10260',
		phone: '081-234-5678',
		taxId: '1234567890123'
	};
	const order = {
		orderNumber: 'DN-2025-0001',
		createdAt: new Date().toISOString(),
		customer: {
			firstName: 'บริษัท ลูกค้า จำกัด (มหาชน)',
			address: '99/9 อาคารซีพี ทาวเวอร์ ถนนสีลม แขวงสุริยวงศ์ เขตบางรัก กรุงเทพฯ 10500',
			phone: '02-987-6543',
			taxId: '0987654321098'
		},
		items: [
			{ product: { name: 'คีย์บอร์ดไร้สาย' }, quantity: 2, price: 750.0, total: 1500.0, unit: 'ชิ้น' },
			{ product: { name: 'เมาส์ออปติคอล' }, quantity: 2, price: 450.0, total: 900.0, unit: 'ชิ้น' },
			{ product: { name: 'จอ Monitor 24 นิ้ว' }, quantity: 1, price: 4500.0, total: 4500.0, unit: 'เครื่อง' }
		],
		total: 6900.0
	};
	// ==========================================

	const paperSize = $page.url.searchParams.get('size') || 'a4';

	onMount(() => {
		// สั่งพิมพ์อัตโนมัติเมื่อหน้านี้โหลดเสร็จ
		setTimeout(() => {
			window.print();
		}, 300);
	});
</script>

<svelte:head>
	<title>ใบส่งของ #{order.orderNumber}</title>
</svelte:head>

<div class="delivery-note-container" class:a4={paperSize === 'a4'} class:a5={paperSize === 'a5'}>
	<header class="doc-header">
		<div class="company-info">
			<h2>{shopInfo.name}</h2>
			<p>{shopInfo.address}</p>
			<p>โทร: {shopInfo.phone}</p>
			<p>เลขประจำตัวผู้เสียภาษี: {shopInfo.taxId}</p>
		</div>
		<div class="doc-details">
			<h1>ใบส่งของ / Delivery Note</h1>
			<p><strong>เลขที่:</strong> {order.orderNumber}</p>
			<p><strong>วันที่:</strong> {new Date(order.createdAt).toLocaleDateString('th-TH')}</p>
		</div>
	</header>

	<section class="customer-info">
		<h3>ข้อมูลลูกค้า</h3>
		<p><strong>ชื่อ:</strong> {order.customer.firstName}</p>
		<p><strong>ที่อยู่:</strong> {order.customer.address}</p>
		<p><strong>โทร:</strong> {order.customer.phone}</p>
		<p><strong>เลขประจำตัวผู้เสียภาษี:</strong> {order.customer.taxId}</p>
	</section>

	<main>
		<table>
			<thead>
				<tr>
					<th>#</th>
					<th class="item-name">รายการ</th>
					<th>จำนวน</th>
					<th>หน่วย</th>
					<th>ราคา/หน่วย</th>
					<th>จำนวนเงิน</th>
				</tr>
			</thead>
			<tbody>
				{#each order.items as item, i}
					<tr>
						<td>{i + 1}</td>
						<td class="item-name">{item.product.name}</td>
						<td class="num">{item.quantity}</td>
						<td class="num">{item.unit}</td>
						<td class="num">{item.price.toFixed(2)}</td>
						<td class="num">{item.total.toFixed(2)}</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<td colspan="5" class="total-label">รวมเป็นเงินทั้งสิ้น</td>
					<td class="num total-value">{order.total.toFixed(2)}</td>
				</tr>
			</tfoot>
		</table>
	</main>

	<footer class="doc-footer">
		<div class="signature-box">
			<p>........................................</p>
			<p>(ผู้ส่งสินค้า)</p>
			<p>วันที่: ...../...../..........</p>
		</div>
		<div class="signature-box">
			<p>........................................</p>
			<p>(ผู้รับสินค้า)</p>
			<p>วันที่: ...../...../..........</p>
		</div>
	</footer>
</div>

<style>
	/* --- General Styles --- */
	:global(body) {
		background-color: #f0f0f0;
		font-family: 'Sarabun', sans-serif;
	}
	.delivery-note-container {
		background-color: white;
		margin: 20px auto;
		padding: 40px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	/* --- Header & Customer Info --- */
	.doc-header {
		display: flex;
		justify-content: space-between;
		border-bottom: 2px solid #333;
		padding-bottom: 15px;
	}
	.doc-header h2 { margin: 0; }
	.doc-header p { margin: 4px 0; font-size: 0.9em; }
	.doc-details { text-align: right; }
	.doc-details h1 { margin: 0 0 10px 0; font-size: 1.5em; color: #333; }

	.customer-info {
		border: 1px solid #ccc;
		padding: 15px;
		border-radius: 5px;
	}
	.customer-info h3 { margin-top: 0; }
	.customer-info p { margin: 5px 0; }

	/* --- Table Styles --- */
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th, td {
		padding: 8px 10px;
		border: 1px solid #ccc;
	}
	thead {
		background-color: #f2f2f2;
	}
	th { font-weight: bold; }
	.item-name { text-align: left; }
	.num { text-align: right; }
	tfoot {
		font-weight: bold;
	}
	.total-label { text-align: right; }
	.total-value { font-size: 1.1em; }

	/* --- Footer --- */
	.doc-footer {
		display: flex;
		justify-content: space-around;
		padding-top: 40px;
		margin-top: auto; /* ดัน footer ไปอยู่ท้ายสุด */
	}
	.signature-box {
		text-align: center;
	}
	.signature-box p {
		margin: 5px 0;
	}

	/* --- Size-Specific Styles --- */
	.a5 {
		width: 148mm;
		min-height: 210mm;
	}
	.a4 {
		width: 210mm;
		min-height: 297mm;
	}

	/* --- Print-Specific Styles --- */
	@media print {
		:global(body) {
			background-color: white;
		}
		.delivery-note-container {
			margin: 0;
			padding: 0;
			box-shadow: none;
			border: none;
		}
	}
</style>