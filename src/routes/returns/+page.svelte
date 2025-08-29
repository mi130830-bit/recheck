<!-- Path: src/routes/returns/+page.svelte (Final Corrected Version) -->
<script lang="ts">
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
					// [แก้ไข] แปลง String เป็น Number ก่อนส่งกลับไปที่ API
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
				// [แก้ไข] แปลงค่าที่ API ส่งกลับมาเป็น Number ก่อนใช้ .toFixed()
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

	// [แก้ไข] แปลง String เป็น Number ก่อนนำไปคำนวณ
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

<div class="container" style="max-width: 900px; margin: 2rem auto;">
	<h1>สร้างรายการรับคืนสินค้า</h1>
	<article>
		<div class="grid">
			<form on:submit|preventDefault={searchOrder} class="grid" style="grid-column: span 3;">
				<label for="search" style="grid-column: 1 / span 2;">
					ค้นหาจากเลขที่บิล
					<input type="search" id="search" name="search" bind:value={searchQuery} placeholder="กรอกเลขที่บิล..." />
				</label>
				<button type="submit" aria-busy={isLoading} style="align-self: end;">ค้นหา</button>
			</form>
			<button class="secondary" on:click={() => showAdvancedSearch = true} style="align-self: end;">
				... หรือค้นหาจากสินค้า
			</button>
		</div>
		{#if errorMessage}<p style="color: var(--pico-color-red-500);"><em>{errorMessage}</em></p>{/if}
		{#if successMessage}<p style="color: var(--pico-color-green-500);"><em>{successMessage}</em></p>{/if}
	</article>

	{#if foundOrder}
		<article>
			<header><strong>รายละเอียดบิล: {foundOrder.orderNumber}</strong></header>
			<p><strong>ลูกค้า:</strong> {foundOrder.customer ? `${foundOrder.customer.firstName} ${foundOrder.customer.lastName || ''}` : 'ลูกค้าทั่วไป'}</p>
			<p><strong>วันที่ขาย:</strong> {new Date(foundOrder.createdAt).toLocaleString('th-TH')}</p>
			<div style="overflow-x: auto;">
				<table>
					<thead>
						<tr>
							<th>สินค้า</th>
							<th style="text-align: right;">ราคา</th>
							<th style="text-align: center;">จำนวนที่ซื้อ</th>
							<th style="text-align: center;">คืนแล้ว</th>
							<th style="width: 120px;">จำนวนที่คืน</th>
						</tr>
					</thead>
					<tbody>
						{#each foundOrder.items as item (item.id)}
							{@const availableToReturn = item.quantity - item.returnedQuantity}
							<tr>
								<td>{item.product.name}</td>
								<!-- [แก้ไข] แปลง String เป็น Number ก่อนใช้ .toFixed() (นี่คือบรรทัด 190) -->
								<td style="text-align: right;">{Number(item.price).toFixed(2)}</td>
								<td style="text-align: center;">{item.quantity}</td>
								<td style="text-align: center;">{item.returnedQuantity}</td>
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
					<label style="grid-column: span 2;"><input type="checkbox" bind:checked={returnToStock} role="switch" />คืนสินค้ากลับเข้าสต็อก</label>
					<label style="grid-column: span 2;">หมายเหตุ/เหตุผลการคืน<input type="text" bind:value={reason} placeholder="เช่น สินค้าชำรุด, ลูกค้าเปลี่ยนใจ..." /></label>
				</div>
				<hr/>
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; font-size: 1.1em;">
					<strong>ยอดเงินคืนรวม:</strong>
					<span style="font-size: 1.2em; font-weight: bold; color: var(--pico-primary);">
						<!-- ส่วนนี้ไม่ต้องแก้ เพราะ totalRefund ถูกคำนวณเป็น Number แล้ว -->
						฿{(totalRefund || 0).toFixed(2)}
					</span>
				</div>
				<button on:click={handleReturn} disabled={isLoading || !totalRefund || totalRefund <= 0} aria-busy={isLoading}>ยืนยันการรับคืน</button>
			</footer>
		</article>
	{/if}
</div>