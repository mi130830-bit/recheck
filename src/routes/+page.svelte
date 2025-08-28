<!-- Path: src/routes/+page.svelte (ฉบับสมบูรณ์ แก้ไขล่าสุด) -->

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Product, Customer } from '@prisma/client';
	import PaymentModal from '$lib/components/PaymentModal.svelte';
	import HeldBillsModal from '$lib/components/HeldBillsModal.svelte';

	// State สำหรับการค้นหา
	let productSearchQuery = '';
	let customerSearchQuery = '';
	let productSearchResults: Product[] = [];
	let customerSearchResults: Customer[] = [];

	// State สำหรับการทำงานหลัก
	let cart: (Product & { quantity: number; discount: number })[] = [];
	let selectedCustomer: Customer | null = null;
	let isLoading = false;
	let productDebounceTimer: number;
	let customerDebounceTimer: number;

	// State สำหรับ Modal
	let showPaymentModal = false;
	let showHeldBillsModal = false;

	// State สำหรับบิลที่พักไว้
	let loadedHeldBillId: number | null = null;

	// === ฟังก์ชันการทำงาน ===

	// ค้นหาสินค้า (เรียก API)
	function handleProductSearchInput() {
		clearTimeout(productDebounceTimer);
		productDebounceTimer = setTimeout(() => searchProducts(), 300);
	}
	async function searchProducts() {
		if (productSearchQuery.trim().length === 0) {
			productSearchResults = [];
			return;
		}
		isLoading = true;
		try {
			const response = await fetch(`/api/products/search?q=${encodeURIComponent(productSearchQuery)}`);
			if (response.ok) productSearchResults = await response.json();
		} finally {
			isLoading = false;
		}
	}

	// ค้นหาลูกค้า (เรียก API)
	function handleCustomerSearchInput() {
		clearTimeout(customerDebounceTimer);
		customerDebounceTimer = setTimeout(() => searchCustomers(), 300);
	}
	async function searchCustomers() {
		if (customerSearchQuery.trim().length === 0) {
			customerSearchResults = [];
			return;
		}
		isLoading = true;
		try {
			const response = await fetch(`/api/customers/search?q=${encodeURIComponent(customerSearchQuery)}`);
			if (response.ok) customerSearchResults = await response.json();
		} finally {
			isLoading = false;
		}
	}

	function selectCustomer(customer: Customer) {
		selectedCustomer = customer;
		customerSearchQuery = '';
		customerSearchResults = [];
	}

	function clearSelectedCustomer() {
		selectedCustomer = null;
	}

	// จัดการตะกร้าสินค้า
	function addToCart(product: Product, quantity = 1) {
		const existingItem = cart.find((item) => item.id === product.id);
		if (existingItem) {
			existingItem.quantity += quantity;
		} else {
			cart = [...cart, { ...product, quantity: quantity, discount: 0 }];
		}
		cart = [...cart]; // Trigger reactivity
		productSearchQuery = '';
		productSearchResults = [];
	}

	function removeFromCart(productId: number) {
		cart = cart.filter((item) => item.id !== productId);
	}

	function adjustQuantity(productId: number, amount: number) {
		const item = cart.find((i) => i.id === productId);
		if (item) {
			const newQuantity = item.quantity + amount;
			if (newQuantity > 0) {
				item.quantity = newQuantity;
				cart = [...cart];
			} else {
				removeFromCart(productId);
			}
		}
	}

	// จัดการบิลและการจ่ายเงิน
	async function handleCheckout(event: CustomEvent<{ paymentType: 'COMPLETED' | 'CREDIT' }>) {
		// ... (ใส่ Logic การ checkout ที่คุณมี) ...
		alert(`กำลังจะจ่ายเงินแบบ ${event.detail.paymentType}`);
		resetSale();
	}

	async function handleHoldBill() {
		// ... (ใส่ Logic การพักบิลที่คุณมี) ...
		alert('พักบิลเรียบร้อย!');
		resetSale();
	}

	function resetSale() {
		cart = [];
		productSearchQuery = '';
		customerSearchQuery = '';
		productSearchResults = [];
		customerSearchResults = [];
		selectedCustomer = null;
		loadedHeldBillId = null;
	}

	// การคำนวณยอดรวม (Reactive)
	$: subtotal = cart.reduce((sum, item) => sum + item.retailPrice * item.quantity, 0);
	$: totalDiscount = cart.reduce((sum, item) => sum + Number(item.discount), 0);
	$: grandTotal = subtotal - totalDiscount;
</script>

<div class="pos-grid" class:loading={isLoading}>
	<!-- ==== คอลัมน์ซ้าย (Main Panel) ==== -->
	<div class="main-panel">
		<!-- การ์ดข้อมูลสมาชิก -->
		<article class="customer-card">
			<header><strong>ข้อมูลสมาชิก</strong></header>
			<div class="customer-section">
				{#if selectedCustomer}
					<div class="customer-display">
						<span><strong>ชื่อ:</strong> {selectedCustomer.name} ({selectedCustomer.phone || selectedCustomer.memberCode})</span>
						<button on:click={clearSelectedCustomer} class="contrast outline small-btn">X</button>
					</div>
				{:else}
					<div class="customer-search-wrapper">
						<input
							type="search"
							placeholder="ค้นหาสมาชิกจาก ชื่อ, เบอร์โทร, รหัส..."
							bind:value={customerSearchQuery}
							on:input={handleCustomerSearchInput}
						/>
						{#if customerSearchResults.length > 0}
							<div class="search-dropdown">
								{#each customerSearchResults as customer (customer.id)}
									<button class="customer-item" on:click={() => selectCustomer(customer)}>
										{customer.name} - {customer.phone || customer.memberCode}
									</button>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</article>

		<!-- การ์ดข้อมูลสินค้าและตะกร้า -->
		<article class="product-card">
			<header><strong>ข้อมูลสินค้า</strong></header>
			<div class="product-search-bar">
				<input type="search" placeholder="ค้นหาจากบาร์โค้ด/ชื่อสินค้า" bind:value={productSearchQuery} on:input={handleProductSearchInput} />
				{#if productSearchResults.length > 0}
					<div class="search-dropdown">
						{#each productSearchResults as product (product.id)}
							<button class="product-item" on:click={() => addToCart(product)}>
								{product.name} - {product.retailPrice.toFixed(2)} บาท
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th>ที่</th>
							<th>บาร์โค้ด</th>
							<th>ชื่อสินค้า</th>
							<th>จำนวน</th>
							<th>ราคา</th>
							<th>ส่วนลด</th>
							<th>รวม</th>
							<th>ลบ</th>
						</tr>
					</thead>
					<tbody>
						{#if cart.length === 0}
							<tr><td colspan="8" class="empty-row">-- เพิ่มสินค้าเพื่อเริ่มการขาย --</td></tr>
						{:else}
							{#each cart as item, i (item.id)}
								<tr>
									<td>{i + 1}</td>
									<td>{item.barcode || '-'}</td>
									<td>{item.name}</td>
									<td>
										<div class="quantity-control">
											<button on:click={() => adjustQuantity(item.id, -1)} class="outline secondary small-btn">-</button>
											<span>{item.quantity}</span>
											<button on:click={() => adjustQuantity(item.id, 1)} class="outline secondary small-btn">+</button>
										</div>
									</td>
									<td>{item.retailPrice.toFixed(2)}</td>
									<td><input type="number" bind:value={item.discount} min="0" class="discount-input" /></td>
									<td>{(item.retailPrice * item.quantity - item.discount).toFixed(2)}</td>
									<td><button on:click={() => removeFromCart(item.id)} class="contrast outline small-btn">X</button></td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</article>
	</div>

	<!-- ==== คอลัมน์ขวา (Summary Panel) ==== -->
	<div class="summary-panel">
		<article class="summary-card">
			<header class="summary-header">
				<strong>{new Date().toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' })}</strong>
				<button class="secondary outline compact" on:click={() => (showHeldBillsModal = true)}>บิลที่พักไว้</button>
			</header>
			<div class="price-summary">
				<span>ราคา</span><input type="text" value="฿{subtotal.toFixed(2)}" readonly />
				<span>ภาษี</span><input type="text" value="฿0.00" readonly />
				<span>ส่วนลด</span><input type="text" value="฿{totalDiscount.toFixed(2)}" readonly />
				<label for="billDiscount">ท้ายบิล</label><input type="number" id="billDiscount" placeholder="0.00" />
				<span class="total-label">รวม</span><input type="text" class="total-input" value="฿{grandTotal.toFixed(2)}" readonly />
			</div>
			<footer class="summary-footer">
				<button class="checkout-btn" disabled={cart.length === 0} on:click={() => (showPaymentModal = true)}>คิดเงิน</button>
				<div class="sub-footer-buttons">
					<button class="secondary" on:click={handleHoldBill} disabled={cart.length === 0}>พักบิล</button>
					<button class="secondary contrast" on:click={resetSale}>ยกเลิก</button>
				</div>
			</footer>
		</article>
	</div>
</div>

<!-- Modals -->
<PaymentModal bind:showModal={showPaymentModal} totalAmount={grandTotal} on:confirm={handleCheckout} on:close={() => (showPaymentModal = false)} />
<HeldBillsModal bind:showModal={showHeldBillsModal} on:select={(e) => alert('Load bill: ' + e.detail.id)} on:close={() => (showHeldBills_Modal = false)} />

<style>
	.pos-grid {
		display: grid;
		grid-template-columns: 1fr 380px;
		gap: 1rem;
		align-items: start;
	}
	.main-panel,
	.summary-panel {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.summary-card {
		position: sticky;
		top: 1rem;
	}
	.customer-search-wrapper,
	.product-search-bar {
		position: relative;
	}
	.search-dropdown {
		position: absolute;
		width: 100%;
		background: var(--pico-card-background-color);
		border: 1px solid var(--pico-form-element-border-color);
		border-radius: var(--pico-border-radius);
		margin-top: 0.25rem;
		z-index: 100;
		max-height: 250px;
		overflow-y: auto;
		box-shadow: var(--pico-box-shadow);
	}
	.customer-item,
	.product-item {
		display: block;
		width: 100%;
		text-align: left;
		padding: 0.75rem 1rem;
		border: none;
		background: none;
		border-bottom: 1px solid var(--pico-card-border-color);
		cursor: pointer;
	}
	.customer-item:last-child,
	.product-item:last-child {
		border-bottom: none;
	}
	.customer-item:hover,
	.product-item:hover {
		background-color: var(--pico-primary-background);
		color: var(--pico-primary-inverse);
	}
	.customer-display {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: var(--pico-muted-background-color);
		padding: 0.5rem 1rem;
		border-radius: var(--pico-border-radius);
	}
	.table-container {
		max-height: 45vh;
		overflow-y: auto;
		margin-top: 1rem;
	}
	table {
		margin-bottom: 0;
	}
	.empty-row {
		text-align: center;
		padding: 2rem;
		color: var(--pico-muted-color);
	}
	.quantity-control {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}
	.small-btn {
		padding: 0.25rem 0.5rem;
		line-height: 1;
	}
	.discount-input {
		max-width: 80px;
		text-align: right;
		padding: 0.25rem 0.5rem;
		height: auto;
	}
	.price-summary {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.75rem;
		align-items: center;
	}
	.price-summary input {
		text-align: right;
	}
	.total-label {
		font-weight: bold;
		font-size: 1.1em;
	}
	.total-input {
		font-weight: bold;
		font-size: 1.2em;
		color: var(--pico-primary);
	}
	.summary-footer {
		margin-top: 1rem;
	}
	.checkout-btn {
		width: 100%;
		padding: 0.75rem;
		font-size: 1.1em;
	}
	.sub-footer-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}
</style>