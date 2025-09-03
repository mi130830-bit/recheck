<script lang="ts">
	// ... (ส่วน script ไม่มีการเปลี่ยนแปลง) ...
	import type { Order, Customer, OrderItem, Product } from '@prisma/client';
	import AdvancedReturnSearch from '$lib/components/AdvancedReturnSearch.svelte';

	type FoundOrder = Order & {
		customer: Customer | null;
		items: (OrderItem & { product: Product })[];
	};

	let searchQuery = '';
	let foundOrder: FoundOrder | null = null;
	let itemsToReturn: Map<number, number> = new Map();
	let isLoading = false;
	let errorMessage = '';
	let successMessage = '';
	let showAdvancedSearch = false;
	let returnToStock = true;
	let reason = '';

	async function searchOrder() {
		if (!searchQuery.trim()) return;
		isLoading = true;
		errorMessage = '';
		successMessage = '';
		foundOrder = null;
		itemsToReturn.clear();
		reason = '';
		returnToStock = true;

		try {
			const response = await fetch(`/api/orders/search-by-number?number=${encodeURIComponent(searchQuery)}`);
			if (response.ok) {
				foundOrder = await response.json();
			} else {
				const error = await response.json();
				errorMessage = error.message || 'ไม่พบบิล';
			}
		} catch (err) {
			errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
		} finally {
			isLoading = false;
		}
	}
	
	async function handleAdvancedSelect(event: CustomEvent<string>) {
		const orderNumber = event.detail;
		showAdvancedSearch = false;
		searchQuery = orderNumber;
		await searchOrder();
	}

	async function handleReturn() {
		if (!foundOrder || itemsToReturn.size === 0) return;

		const payloadItems = Array.from(itemsToReturn.entries())
			.filter(([, quantity]) => quantity > 0)
			.map(([orderItemId, quantityToReturn]) => {
				const originalItem = foundOrder?.items.find((i) => i.id === orderItemId);
				return {
					orderItemId,
					productId: originalItem!.productId,
					quantityToReturn,
					price: Number(originalItem!.price)
				};
			});

		if (payloadItems.length === 0) {
			errorMessage = 'กรุณาระบุจำนวนสินค้าที่ต้องการคืน';
			return;
		}

		isLoading = true;
		errorMessage = '';
		successMessage = '';
		try {
			const response = await fetch('/api/returns', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					orderId: foundOrder.id,
					itemsToReturn: payloadItems,
					reason: reason,
					returnToStock: returnToStock
				})
			});

			if (response.ok) {
				const newReturn = await response.json();
				successMessage = `รับคืนสินค้าสำเร็จ! ยอดคืนรวม: ${Number(newReturn.totalRefundAmount).toFixed(2)} บาท`;
				foundOrder = null;
				searchQuery = '';
				itemsToReturn.clear();
				reason = '';
				returnToStock = true;
			} else {
				const error = await response.json();
				errorMessage = error.message || 'เกิดข้อผิดพลาด';
			}
		} catch (err) {
			errorMessage = 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
		} finally {
			isLoading = false;
		}
	}

	function setReturnQuantity(item: OrderItem, quantityStr: string) {
		const quantity = parseInt(quantityStr) || 0;
		const availableToReturn = item.quantity - item.returnedQuantity;
		const validQuantity = Math.max(0, Math.min(quantity, availableToReturn));
		itemsToReturn.set(item.id, validQuantity);
		itemsToReturn = itemsToReturn; // Trigger reactivity
	}

	$: totalRefund =
		foundOrder &&
		Array.from(itemsToReturn.entries()).reduce((sum, [orderItemId, quantity]) => {
			const item = foundOrder?.items.find((i) => i.id === orderItemId);
			return sum + (item ? Number(item.price) * quantity : 0);
		}, 0);
</script>

<svelte:head>
	<title>สร้างรายการรับคืนสินค้า</title>
</svelte:head>

<AdvancedReturnSearch bind:showModal={showAdvancedSearch} on:selectOrder={handleAdvancedSelect} on:close={() => showAdvancedSearch = false} />

<div class="container page-container">
	<h1>สร้างรายการรับคืนสินค้า</h1>
	<article>
		<!-- [แก้ไข] ปรับโครงสร้าง HTML ทั้งหมดในส่วนนี้ -->
		<label for="search">ค้นหาจากเลขที่บิล</label>
		<div class="grid search-controls">
			<input
				type="search"
				id="search"
				name="search"
				class="search-input"
				bind:value={searchQuery}
				placeholder="กรอกเลขที่บิล..."
				on:keydown={(e) => {
					if (e.key === 'Enter') searchOrder();
				}}
			/>
			<button on:click={searchOrder} class="primary search-button" aria-busy={isLoading}>ค้นหา</button>
			<button class="secondary" on:click={() => (showAdvancedSearch = true)}>ค้นหาจากสินค้า</button>
		</div>
		<!-- สิ้นสุดส่วนที่แก้ไขโครงสร้าง -->

		{#if errorMessage}<p class="error-message"><em>{errorMessage}</em></p>{/if}
		{#if successMessage}<p class="success-message"><em>{successMessage}</em></p>{/if}
	</article>

	{#if foundOrder}
		<article>
			<!-- ... ส่วนแสดงผลบิล (ไม่มีการเปลี่ยนแปลง) ... -->
			<header><strong>รายละเอียดบิล: {foundOrder.orderNumber}</strong></header>
			<p><strong>ลูกค้า:</strong> {foundOrder.customer ? `${foundOrder.customer.firstName} ${foundOrder.customer.lastName || ''}` : 'ลูกค้าทั่วไป'}</p>
			<p><strong>วันที่ขาย:</strong> {new Date(foundOrder.createdAt).toLocaleString('th-TH')}</p>
			<div class="table-wrapper">
				<table>
					<thead>
						<tr>
							<th>สินค้า</th>
							<th class="text-right">ราคา</th>
							<th class="text-center">จำนวนที่ซื้อ</th>
							<th class="text-center">คืนแล้ว</th>
							<th class="return-quantity-column">จำนวนที่คืน</th>
						</tr>
					</thead>
					<tbody>
						{#each foundOrder.items as item (item.id)}
							{@const availableToReturn = item.quantity - item.returnedQuantity}
							<tr>
								<td>{item.product.name}</td>
								<td class="text-right">{Number(item.price).toFixed(2)}</td>
								<td class="text-center">{item.quantity}</td>
								<td class="text-center">{item.returnedQuantity}</td>
								<td>
									<input
										type="number"
										min="0"
										max={availableToReturn}
										value={itemsToReturn.get(item.id) || 0}
										on:input={(e) => setReturnQuantity(item, e.currentTarget.value)}
										disabled={availableToReturn <= 0}
										placeholder={availableToReturn <= 0 ? 'คืนครบแล้ว' : '0'}
									/>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<footer>
				<div class="grid">
					<label class="footer-label"><input type="checkbox" bind:checked={returnToStock} role="switch" />คืนสินค้ากลับเข้าสต็อก</label>
					<label class="footer-label">หมายเหตุ/เหตุผลการคืน<input type="text" bind:value={reason} placeholder="เช่น สินค้าชำรุด, ลูกค้าเปลี่ยนใจ..." /></label>
				</div>
				<hr/>
				<div class="total-refund-summary">
					<strong>ยอดเงินคืนรวม:</strong>
					<span class="total-refund-amount">
						฿{(totalRefund || 0).toFixed(2)}
					</span>
				</div>
				<button on:click={handleReturn} class="primary" disabled={isLoading || !totalRefund || totalRefund <= 0} aria-busy={isLoading}>ยืนยันการรับคืน</button>
			</footer>
		</article>
	{/if}
</div>

<style>
:root {
  /* ตัวแปรสีปุ่มและ input */
  --primary-blue: #15cb24;
  --primary-blue-hover: #26c217;
  --secondary-gray: #f47812;
  --secondary-gray-hover: #e53306;
  --danger-red: #e53935;
  --danger-red-hover: #b71c1c;
  --btn-text: #fff;
  --input-bg: #fafcff;
  --input-border: #dde2e6;
}

/* กล่องหลักของหน้า */
.container, .page-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0;
}

/* กล่องค้นหาข้อมูล */
.grid {
  display: flex;
  gap: 0.5rem; /* ระยะห่างระหว่าง input และปุ่ม */
  align-items: baseline; /* จัดตำแหน่ง element */
  margin-bottom: 1.5rem;
}

/* ช่องค้นหา input ทั่วไป */
input[type="search"],
input[type="text"],
input[type="number"] {
  padding: 0.5rem 3rem;
  border-radius: 35px;
  border: 1px solid var(--input-border);
  font-size: 1.1rem;
  background: var(--input-bg);
  width: 700px;
  transition: border-color 0.2s;
}
input[type="search"]:focus,
input[type="text"]:focus,
input[type="number"]:focus {
  border-color: var(--primary-blue);
  outline: none;
}

/* ปุ่มค้นหา / ปุ่มหลัก */
button[type="submit"],
button:not([type]) {
  min-width: 170px;
  height: 65px;
  border-radius: 10px;
  background: var(--primary-blue);
  color: var(--btn-text);
  font-size: 1.1rem;
  border: none;
  transition: background 0.2s;
  font-weight: 500;
  cursor: pointer;
}
button[type="submit"]:hover,
button[type="submit"]:focus,
button:not([type]):hover,
button:not([type]):focus {
  background: var(--primary-blue-hover);
}

/* ปุ่มค้นหาขั้นสูง / ปุ่มรอง */
button.secondary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: baseline;
  background: var(--secondary-gray);
  color: var(--btn-text);
  font-size: 1.08rem;
  border-radius: 10px;
  min-width: 170px;
  height: 65px;
  border: none;
  font-weight: 500;
  margin-left: 0.1rem;
  transition: background 0.2s;
  cursor: pointer;
}
button.secondary:hover,
button.secondary:focus {
  background: var(--secondary-gray-hover);
}

/* ปุ่มอันตราย ช่น ปุ่มลบ */
button.danger {
  background: var(--danger-red);
  color: var(--btn-text);
  border-radius: 10px;
  min-width: 120px;
  font-size: 1.08rem;
  border: none;
  font-weight: 500;
  transition: background 0.2s;
}
button.danger:hover,
button.danger:focus {
  background: var(--danger-red-hover);
}

/* ขยายขนาด input สำหรับจำนวนคืนในตาราง */
table input[type="number"] {
  width: 80px;
  padding-right: 8px;
  padding-left: 8px;
  border-radius: 7px;
}

/* ปุ่มใน footer ยืนยันการรับคืน */
footer button {
  width: 100%;
  max-width: 360px;
  margin: 1rem auto 0 auto;
  display: block;
  background: var(--primary-blue);
  color: var(--btn-text);
  border-radius: 12px;
  border: none;
  height: 52px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
}
footer button[disabled] {
  background: #b9dbf2;
  color: #eee;
  cursor: not-allowed;
}
footer button:hover:enabled,
footer button:focus:enabled {
  background: var(--primary-blue-hover);
}

/* ข้อความแจ้ง error */
.error-message {
  color: var(--danger-red);
}

/* ข้อความแจ้ง success */
.success-message {
  color: #27c346;
}

/* ตาราง */
.table-wrapper {
  overflow-x: auto;
}

/* จัดข้อความตามแนว */
.text-right {
  text-align: right;
}
.text-center {
  text-align: center;
}

/* ความกว้างคอลัมน์จำนวนคืน */
.return-quantity-column {
  width: 120px;
}

/* label ใน footer */
.footer-label {
  grid-column: span 2;
}

/* รวมยอดเงินคืน */
.total-refund-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 1.1em;
}
.total-refund-amount {
  font-size: 1.2em;
  font-weight: bold;
  color: var(--pico-primary);
}

/* แก้ไขปุ่มค้นหาให้สวยและเท่ากับ input */
.search-button {
  height: var(--pico-form-element-height);
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

</style>