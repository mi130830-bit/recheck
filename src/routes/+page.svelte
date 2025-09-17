<script lang="ts">
	import type { PageData } from './$types';
	import type { Product, Customer, Order, OrderItem } from '@prisma/client';
	import PaymentModal from '$lib/components/PaymentModal.svelte';
	import HeldBillsModal from '$lib/components/HeldBillsModal.svelte';
	import SaleSuccessModal from '$lib/components/SaleSuccessModal.svelte';

	let { data } = $props<PageData>();
	type FullOrder = Order & { customer: Customer | null; items: (OrderItem & { product: Product })[] };

	// --- State สำหรับการค้นหา ---
	let productSearchQuery = $state('');
	let customerSearchQuery = $state('');
	let productSearchResults = $state<Product[]>([]);
	let customerSearchResults = $state<Customer[]>([]);
	let productSearchLoading = $state(false);
	let customerSearchLoading = $state(false);

	// --- State สำหรับการทำงานหลัก ---
	let cart = $state<(Product & { quantity: number; discount: number })[]>([]);
	// [แก้ไข] แก้ไขการกำหนด Type ของ selectedCustomer ให้ถูกต้อง
	let selectedCustomer = $state<Customer | null>(null);
	let isLoading = $state(false);
	let showPaymentModal = $state(false);
	let showHeldBillsModal = $state(false);
	let showSaleSuccessModal = $state(false);
	let newOrderId = $state<number | null>(null);
	let loadedHeldBillId = $state<number | null>(null);
	let heldBillsCount = $state(0);
	let highlightedIndex = $state(-1);
	let currentDate = $state('');
	let currentTime = $state('');
	let billDiscount = $state(0);

	// --- ฟังก์ชันการทำงาน (API Calls) ---
	async function searchProducts() {
		if (productSearchQuery.trim().length < 2) {
			productSearchResults = [];
			return;
		}
		productSearchLoading = true;
		try {
			const response = await fetch(`/api/products/search?q=${encodeURIComponent(productSearchQuery)}`);
			if (response.ok) {
				productSearchResults = await response.json();
			}
		} catch (err) {
			console.error("Failed to search products:", err);
			productSearchResults = [];
		} finally {
			productSearchLoading = false;
			highlightedIndex = -1;
		}
	}

	async function searchCustomers() {
		if (customerSearchQuery.trim().length < 2) {
			customerSearchResults = [];
			return;
		}
		customerSearchLoading = true;
		try {
			const response = await fetch(`/api/customers/search?q=${encodeURIComponent(customerSearchQuery)}`);
			if (response.ok) {
				customerSearchResults = await response.json();
			}
		} catch (err) {
			console.error("Failed to search customers:", err);
			customerSearchResults = [];
		} finally {
			customerSearchLoading = false;
		}
	}

	// --- Debounce Effect สำหรับการค้นหา ---
	let productDebounceTimer: number;
	$effect(() => {
		clearTimeout(productDebounceTimer);
		productDebounceTimer = setTimeout(() => {
			searchProducts();
		}, 300);
	});

	let customerDebounceTimer: number;
	$effect(() => {
		clearTimeout(customerDebounceTimer);
		customerDebounceTimer = setTimeout(() => {
			searchCustomers();
		}, 300);
	});

	// --- Derived State สำหรับคำนวณยอดรวม ---
	const subtotal = $derived(
		cart.reduce((sum, item) => sum + Number(item.retailPrice) * item.quantity, 0)
	);
	const totalDiscount = $derived(
		cart.reduce((sum, item) => sum + Number(item.discount || 0) * item.quantity, 0)
	);
	const grandTotal = $derived(subtotal - totalDiscount - billDiscount);

	// --- Effect สำหรับนาฬิกาและโหลดบิลพัก ---
	$effect(() => {
		const timer = setInterval(() => {
			const now = new Date();
			currentDate = now.toLocaleDateString('th-TH', { dateStyle: 'long', calendar: 'buddhist' });
			currentTime = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
		}, 1000);

		async function fetchHeldBills() {
			try {
				const response = await fetch('/api/orders/hold');
				if (response.ok) {
					heldBillsCount = (await response.json()).length;
				}
			} catch (err) {
				console.error('Failed to fetch held bills count:', err);
			}
		}
		fetchHeldBills();
		return () => clearInterval(timer);
	});

	// --- ฟังก์ชันจัดการต่างๆ ---
	function selectCustomer(customer: Customer) {
		selectedCustomer = customer;
		customerSearchQuery = '';
		customerSearchResults = [];
	}

	function clearSelectedCustomer() {
		selectedCustomer = null;
	}

	function addToCart(product: Product, quantity = 1) {
		const existingItem = cart.find((item) => item.id === product.id);
		if (existingItem) {
			existingItem.quantity += quantity;
		} else {
			cart.push({ ...product, quantity, discount: 0 });
		}
		productSearchQuery = '';
		productSearchResults = [];
		highlightedIndex = -1;
	}

	function removeFromCart(productId: number) {
		cart = cart.filter((item) => item.id !== productId);
	}

	function updateQuantity(item: (typeof cart)[0], newQuantityStr: string) {
		const newQuantity = parseInt(newQuantityStr) || 1;
		if (newQuantity > 0) {
			item.quantity = newQuantity;
		} else {
			removeFromCart(item.id);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (productSearchResults.length === 0) return;
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			highlightedIndex = (highlightedIndex + 1) % productSearchResults.length;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			highlightedIndex =
				(highlightedIndex - 1 + productSearchResults.length) % productSearchResults.length;
		} else if (event.key === 'Enter') {
			event.preventDefault();
			if (highlightedIndex > -1) {
				addToCart(productSearchResults[highlightedIndex]);
			} else if (productSearchResults.length > 0) {
				addToCart(productSearchResults[0]);
			}
		}
	}

	async function handleCheckout(
		event: CustomEvent<{
			paymentType: 'COMPLETED' | 'CREDIT';
			received: number;
			change: number;
			notifyDispatch?: boolean;
		}>
	) {
		const { paymentType, received, change, notifyDispatch = false } = event.detail;
		if (cart.length === 0) return;
		if (paymentType === 'CREDIT' && !selectedCustomer) {
			alert('กรุณาเลือกสมาชิกก่อนทำการขายเชื่อ');
			return;
		}
		isLoading = true;
		try {
			const payload = {
				cart: cart.map((item) => ({
					id: item.id,
					quantity: Number(item.quantity),
					retailPrice: Number(item.retailPrice),
					discount: Number(item.discount || 0)
				})),
				customerId: selectedCustomer ? selectedCustomer.id : null,
				paymentType: paymentType,
				received: received,
				change: change,
				heldBillIdToDelete: loadedHeldBillId,
				notifyDispatch: notifyDispatch
			};
			const response = await fetch('/api/orders', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			if (response.ok) {
				const newOrder = await response.json();
				newOrderId = newOrder.id;
				showSaleSuccessModal = true;
				if (loadedHeldBillId) {
					heldBillsCount--;
				}
			} else {
				const error = await response.json();
				alert(`เกิดข้อผิดพลาด: ${error.message}`);
			}
		} catch (error) {
			console.error('Checkout error:', error);
			alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
		} finally {
			isLoading = false;
			showPaymentModal = false;
		}
	}

	async function handleHoldBill() {
		if (cart.length === 0) return;
		isLoading = true;
		try {
			const payload = {
				cart: cart.map((item) => ({
					id: item.id,
					quantity: item.quantity,
					discount: item.discount,
					retailPrice: item.retailPrice
				})),
				customerId: selectedCustomer ? selectedCustomer.id : null
			};
			const response = await fetch('/api/orders/hold', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			if (response.ok) {
				alert('พักบิลเรียบร้อย!');
				heldBillsCount++;
				resetSale();
			} else {
				const errorData = await response.json();
				alert(`เกิดข้อผิดพลาดในการพักบิล: ${errorData.message || 'กรุณาลองใหม่อีกครั้ง'}`);
			}
		} catch (error) {
			console.error('Hold bill submission error:', error);
			alert('เกิดข้อผิดพลาดในการเชื่อมต่อ ไม่สามารถพักบิลได้');
		} finally {
			isLoading = false;
		}
	}

	async function resetSale() {
		if (loadedHeldBillId) {
			try {
				await fetch(`/api/orders/hold/${loadedHeldBillId}`, { method: 'DELETE' });
				heldBillsCount--;
			} catch (err) {
				console.error('Failed to delete held bill on reset:', err);
			}
		}
		cart = [];
		productSearchQuery = '';
		customerSearchQuery = '';
		selectedCustomer = null;
		loadedHeldBillId = null;
		highlightedIndex = -1;
		billDiscount = 0;
	}

	function loadHeldBill(order: FullOrder) {
		if (loadedHeldBillId) {
			resetSale();
		}
		selectedCustomer = order.customer;
		cart = order.items.map((item) => ({
			...item.product,
			quantity: item.quantity,
			discount: Number(item.discount || 0)
		}));
		loadedHeldBillId = order.id;
		showHeldBillsModal = false;
	}

	function closeSuccessModalAndReset() {
		showSaleSuccessModal = false;
		newOrderId = null;
		resetSale();
	}
</script>

<div class="pos-grid" class:loading="{isLoading}">
	<div class="main-panel">
		<article class="customer-card">
			<header><strong>ข้อมูลสมาชิก</strong></header>
			<div class="customer-section">
				{#if selectedCustomer}
					<div class="customer-display">
						<div class="customer-info-text">
							<span
								><strong>ชื่อ:</strong>
								{selectedCustomer.firstName}
								{selectedCustomer.lastName || ''} ({selectedCustomer.phone ||
									selectedCustomer.memberCode})</span
							>
							{#if selectedCustomer.shippingAddress}
								<div class="customer-address">
									<strong>ที่อยู่:</strong>
									{selectedCustomer.shippingAddress}
								</div>
							{/if}
						</div>
						<button onclick={clearSelectedCustomer} class="contrast outline small-btn">X</button>
					</div>
				{:else}
					<div class="customer-search-wrapper">
						<input
							type="search"
							placeholder="ค้นหาสมาชิกจาก ชื่อ, เบอร์โทร, รหัส..."
							bind:value={customerSearchQuery}
						/>
						{#if customerSearchResults.length > 0}
							<div class="search-dropdown">
								{#each customerSearchResults as customer (customer.id)}
									<button class="customer-item" onclick={() => selectCustomer(customer)}>
										{customer.firstName}
										{customer.lastName || ''} - {customer.phone || customer.memberCode}
									</button>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</article>

		<article class="product-card">
			<header><strong>ข้อมูลสินค้า</strong></header>
			<div class="product-search-bar">
				<input
					type="search"
					placeholder="ค้นหาจากบาร์โค้ด/ชื่อสินค้า/ตัวย่อ"
					bind:value={productSearchQuery}
					onkeydown={handleKeydown}
				/>
				{#if productSearchResults.length > 0}
					<div class="search-dropdown">
						{#each productSearchResults as product, i (product.id)}
							<button
								class="product-item"
								class:highlighted={i === highlightedIndex}
								onclick={() => addToCart(product)}
							>
								{product.name} - {Number(product.retailPrice).toFixed(2)} บาท
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th class="col-no">ที่</th>
							<th class="col-name">ชื่อสินค้า</th>
							<th class="col-qty">จำนวน</th>
							<th class="col-price">ราคา</th>
							<th class="col-discount">ส่วนลด</th>
							<th class="col-total">รวม</th>
							<th class="col-delete">ลบ</th>
						</tr>
					</thead>
					<tbody>
						{#if cart.length === 0}
							<tr><td colspan="7" class="empty-row">-- เพิ่มสินค้าเพื่อเริ่มการขาย --</td></tr>
						{:else}
							{#each cart as item (item.id)}
								<tr>
									<td class="col-no">{cart.indexOf(item) + 1}</td>
									<td class="col-name">{item.name}</td>
									<td class="col-qty">
										<input
											type="number"
											class="table-input"
											value={item.quantity}
											min="1"
											oninput={(e) => updateQuantity(item, e.currentTarget.value)}
										/>
									</td>
									<td class="col-price">
										<input
											type="number"
											step="0.01"
											bind:value={item.retailPrice}
											class="table-input"
										/>
									</td>
									<td class="col-discount">
										<input
											type="number"
											bind:value={item.discount}
											min="0"
											class="table-input"
										/>
									</td>
									<td class="col-total">
										{(
											(Number(item.retailPrice) - Number(item.discount || 0)) *
											item.quantity
										).toFixed(2)}
									</td>
									<td class="col-delete">
										<button
											onclick={() => removeFromCart(item.id)}
											class="contrast outline small-btn">X</button
										>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</article>
	</div>

	<div class="summary-panel">
		<article class="summary-card">
			<header class="summary-header">
				<div class="date-time-section">
					<strong class="date">{currentDate || '...'}</strong>
					<span class="time">{currentTime || '...'}</span>
				</div>
				<button class="secondary outline" onclick={() => (showHeldBillsModal = true)}>
					{heldBillsCount} รายการพักบิล
				</button>
			</header>
			<div class="price-summary">
				<span>ราคา</span><input type="text" value="฿{subtotal.toFixed(2)}" readonly />
				<span>ภาษี</span><input type="text" value="฿0.00" readonly />
				<span>ส่วนลด</span><input type="text" value="฿{totalDiscount.toFixed(2)}" readonly />
				<label for="billDiscount">ท้ายบิล</label>
				<input type="number" id="billDiscount" placeholder="0.00" bind:value={billDiscount} min="0" />
				<span class="total-label">รวม</span><input
					type="text"
					class="total-input"
					value="฿{grandTotal.toFixed(2)}"
					readonly
				/>
			</div>
			<footer class="summary-footer">
				<button
					class="main-action-btn"
					disabled={cart.length === 0}
					onclick={() => (showPaymentModal = true)}>คิดเงิน</button
				>

				<div class="sub-footer-buttons">
					<button class="secondary" onclick={handleHoldBill} disabled={cart.length === 0}
						>พักบิล</button
					>
					<button class="danger-solid" onclick={resetSale}>ยกเลิก</button>
				</div>
			</footer>
		</article>
	</div>
</div>

<PaymentModal
	bind:showModal={showPaymentModal}
	totalAmount={grandTotal}
	onconfirm={handleCheckout}
	onclose={() => (showPaymentModal = false)}
	customerId={selectedCustomer?.id}
/>
<HeldBillsModal
	bind:showModal={showHeldBillsModal}
	onselect={(event) => loadHeldBill(event.detail)}
	onclose={() => (showHeldBillsModal = false)}
/>
<SaleSuccessModal
	bind:showModal={showSaleSuccessModal}
	newOrderId={newOrderId}
	oncloseAndReset={closeSuccessModalAndReset}
/>

<style>
	.summary-footer {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid #d1d5db;
	}
	.search-dropdown {
		position: absolute;
		width: 100%;
		background: white;
		color: #212529;
		border: 1px solid var(--pico-form-element-border-color, #d1d5db);
		border-radius: var(--pico-border-radius, 8px);
		margin-top: 0.25rem;
		z-index: 100;
		max-height: 250px;
		overflow-y: auto;
		box-shadow: var(--pico-box-shadow, 0 2px 8px rgba(0, 0, 0, 0.1));
		display: block;
	}
	.product-item,
	.customer-item {
		display: block;
		width: 100%;
		text-align: left;
		padding: 0.75rem 1rem;
		border: none;
		background: transparent;
		border-bottom: 1px solid var(--pico-card-border-color, #e9ecef);
		cursor: pointer;
		white-space: normal;
		color: #212529;
	}
	.product-item:last-child,
	.customer-item:last-child {
		border-bottom: none;
	}
	.product-item:hover,
	.product-item.highlighted,
	.customer-item:hover {
		background-color: var(--pico-primary-background);
		color: var(--pico-primary-inverse);
	}
	.pos-grid {
		display: grid;
		grid-template-columns: 1fr 370px;
		gap: 1rem;
		align-items: flex-start;
	}
	.main-panel {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.summary-panel {
		position: sticky;
		top: 1.5rem;
		min-width: 320px;
		max-width: 370px;
		height: fit-content;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
	}
	.summary-card {
		background: #f8fafc;
		border-radius: 10px;
		box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
		padding: 1.4rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.summary-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #d1d5db;
	}
	.date-time-section {
		text-align: center;
	}
	.date {
		font-size: 1.1em;
		font-weight: 600;
	}
	.time {
		font-size: 1em;
		color: #6c757d;
	}
	.secondary.outline {
		background: #fff;
		color: #2176ff;
		border: 1px solid #2176ff;
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		cursor: pointer;
		transition: background-color 0.15s;
	}
	.secondary.outline:hover {
		background-color: #e0ebff;
	}

	.price-summary {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.7rem;
		align-items: center;
	}
	.price-summary input {
		text-align: right;
	}
	.main-action-btn {
		background: #28a745;
		border: 1px solid #28a745;
		color: #fff;
		border-radius: 6px;
		padding: 0.8rem;
		font-size: 1.07em;
		font-weight: 600;
		cursor: pointer;
		width: 100%;
		transition: background 0.2s;
	}
	.main-action-btn:hover {
		background: #218838;
	}

	.danger-solid {
		background: #dc3545;
		border: 1px solid #dc3545;
		color: #fff;
		border-radius: 6px;
		padding: 0.75rem;
		font-size: 1em;
		font-weight: 600;
		cursor: pointer;
		width: 100%;
		transition: background 0.2s;
	}
	.danger-solid:hover {
		background: #c82333;
	}
	.sub-footer-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.6rem;
		margin-top: 0.5rem;
	}
	.table-container {
		max-height: 45vh;
		overflow-y: auto;
		margin-top: 1.5rem;
	}
	table {
		table-layout: fixed;
		width: 100%;
		border-collapse: separate;
		border-spacing: 0;
	}
	thead th,
	tbody td {
		vertical-align: middle;
		padding: 0.35rem 0.5rem;
	}
	.col-no {
		width: 5%;
		text-align: center;
	}
	.col-name {
		width: 55%;
		text-align: left;
	}
	.col-qty {
		width: 7%;
		text-align: center;
	}
	.col-price {
		width: 8%;
		text-align: center;
	}
	.col-discount {
		width: 8%;
		text-align: center;
	}
	.col-total {
		width: 12%;
		text-align: right;
	}
	.col-delete {
		width: 5%;
		text-align: center;
	}
	.table-input {
		width: 100%;
		height: 2em;
		padding: 0 0.5rem;
		font-size: 1em;
		text-align: center;
		vertical-align: middle;
		box-sizing: border-box;
		border-radius: var(--pico-border-radius, 6px);
		border: 1px solid var(--pico-form-element-border-color, #d1d5db);
		margin: 0;
		background: #fff;
	}
	.empty-row {
		text-align: center;
		padding: 2rem;
		color: #8c98a4;
	}
	.small-btn {
		padding: 0.25rem 0.5rem;
		line-height: 1;
	}
</style>