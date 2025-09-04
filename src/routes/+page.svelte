<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Product, Customer, Order, OrderItem } from '@prisma/client';
	import PaymentModal from '$lib/components/PaymentModal.svelte';
	import HeldBillsModal from '$lib/components/HeldBillsModal.svelte';
	import SaleSuccessModal from '$lib/components/SaleSuccessModal.svelte';

	type FullOrder = Order & { customer: Customer | null; items: (OrderItem & { product: Product })[] };

	// --- State ---
	let productSearchQuery = '';
	let customerSearchQuery = '';
	let productSearchResults: Product[] = [];
	let customerSearchResults: Customer[] = [];
	let cart: (Product & { quantity: number; discount: number })[] = [];
	let selectedCustomer: Customer | null = null;
	let isLoading = false;
	let productDebounceTimer: NodeJS.Timeout;
	let customerDebounceTimer: NodeJS.Timeout;
	let showPaymentModal = false;
	let showHeldBillsModal = false;
	let showSaleSuccessModal = false;
	let newOrderId: number | null = null;
	let loadedHeldBillId: number | null = null;
	let heldBillsCount = 0;
	let highlightedIndex = -1;
	let currentDate = '';
	let currentTime = '';
	let timer: NodeJS.Timeout;
	let billDiscount = 0;

	// --- Lifecycle Hooks ---
	onMount(async () => {
		timer = setInterval(() => {
			const now = new Date();
			currentDate = now.toLocaleDateString('th-TH', {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
				calendar: 'buddhist'
			});
			currentTime = now.toLocaleTimeString('th-TH', {
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit'
			});
		}, 1000);

		try {
			const response = await fetch('/api/orders/hold');
			if (response.ok) {
				const heldBills = await response.json();
				heldBillsCount = heldBills.length;
			}
		} catch (err) {
			console.error('Failed to fetch held bills count:', err);
		}
	});

	onDestroy(() => {
		clearInterval(timer);
	});

	// --- Functions ---
	function handleProductSearchInput() {
		clearTimeout(productDebounceTimer);
		productDebounceTimer = setTimeout(() => searchProducts(), 300);
	}

	async function searchProducts() {
		highlightedIndex = -1;
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
		highlightedIndex = -1;
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

	function updateQuantity(itemIndex: number, newQuantityStr: string) {
		const newQuantity = parseInt(newQuantityStr) || 1;
		if (newQuantity > 0) {
			cart[itemIndex].quantity = newQuantity;
			cart = [...cart];
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (productSearchResults.length === 0) return;
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			highlightedIndex = (highlightedIndex + 1) % productSearchResults.length;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			highlightedIndex = (highlightedIndex - 1 + productSearchResults.length) % productSearchResults.length;
		} else if (event.key === 'Enter') {
			event.preventDefault();
			if (highlightedIndex !== -1) {
				addToCart(productSearchResults[highlightedIndex]);
			} else if (productSearchResults.length > 0) {
				addToCart(productSearchResults[0]);
			}
		}
	}

	async function handleCheckout(event: CustomEvent<{ paymentType: 'COMPLETED' | 'CREDIT'; received: number; change: number }>) {
		const { paymentType, received, change } = event.detail;
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
				heldBillIdToDelete: loadedHeldBillId
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
		productSearchResults = [];
		customerSearchResults = [];
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

	// --- Computed Properties ---
	$: subtotal = cart.reduce((sum, item) => sum + Number(item.retailPrice) * item.quantity, 0);
	$: totalDiscount = cart.reduce((sum, item) => sum + Number(item.discount || 0) * item.quantity, 0);
	$: grandTotal = subtotal - totalDiscount - (billDiscount || 0);
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
								><strong>ชื่อ:</strong> {selectedCustomer.firstName} {selectedCustomer.lastName ||
									''} ({selectedCustomer.phone || selectedCustomer.memberCode})</span
							>
							{#if selectedCustomer.shippingAddress}
								<div class="customer-address">
									<strong>ที่อยู่:</strong> {selectedCustomer.shippingAddress}
								</div>
							{/if}
						</div>
						<button on:click="{clearSelectedCustomer}" class="contrast outline small-btn">X</button>
					</div>
				{:else}
					<div class="customer-search-wrapper">
						<input
							type="search"
							placeholder="ค้นหาสมาชิกจาก ชื่อ, เบอร์โทร, รหัส..."
							bind:value="{customerSearchQuery}"
							on:input="{handleCustomerSearchInput}"
						/>
						{#if customerSearchResults.length > 0}
							<div class="search-dropdown">
								{#each customerSearchResults as customer (customer.id)}
									<button class="customer-item" on:click="{() => selectCustomer(customer)}">
										{customer.firstName} {customer.lastName ||
											''} - {customer.phone || customer.memberCode}
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
					placeholder="ค้นหาจากบาร์โค้ด/ชื่อสินค้า"
					bind:value="{productSearchQuery}"
					on:input="{handleProductSearchInput}"
					on:keydown="{handleKeydown}"
				/>
				{#if productSearchResults.length > 0}
					<div class="search-dropdown">
						{#each productSearchResults as product, i (product.id)}
							<button
								class="product-item"
								class:highlighted="{i === highlightedIndex}"
								on:click="{() => addToCart(product)}"
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
							<th style="width: 5%;">ที่</th>
							<th style="width: 50%;">ชื่อสินค้า</th>
							<th style="width: 10%;">จำนวน</th>
							<th style="width: 12%;">ราคา</th>
							<th style="width: 11%;">ส่วนลด</th>
							<th style="width: 12%;">รวม</th>
							<th style="width: 5%;">ลบ</th>
						</tr>
					</thead>
					<tbody>
						{#if cart.length === 0}
							<tr><td colspan="7" class="empty-row">-- เพิ่มสินค้าเพื่อเริ่มการขาย --</td></tr>
						{:else}
							{#each cart as item, i (item.id)}
								<tr>
									<td class="td-center">{i + 1}</td>
									<td>{item.name}</td>
									<td class="td-center">
										<div class="quantity-control">
											<input
												type="number"
												class="quantity-input"
												value="{item.quantity}"
												min="1"
												on:input="{(e) => updateQuantity(i, e.currentTarget.value)}"
											/>
											<div class="spinner-buttons">
												<button on:click="{() => adjustQuantity(item.id, 1)}" class="outline secondary small-btn spinner-up">▲</button>
												<button on:click="{() => adjustQuantity(item.id, -1)}" class="outline secondary small-btn spinner-down">▼</button>
											</div>
										</div>
									</td>
									<td class="td-center">
										<input type="number" step="0.01" bind:value={item.retailPrice} class="price-input" />
									</td>
									<td class="td-center"><input type="number" bind:value="{item.discount}" min="0" class="discount-input" /></td>
									<td class="td-right">{((Number(item.retailPrice) - Number(item.discount || 0)) * item.quantity).toFixed(2)}</td>
									<td class="td-center">
										<button on:click="{() => removeFromCart(item.id)}" class="contrast outline small-btn">X</button>
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
				<button class="secondary outline" on:click="{() => (showHeldBillsModal = true)}">
					{heldBillsCount} รายการพักบิล
				</button>
			</header>

			<div class="price-summary">
				<span>ราคา</span><input type="text" value="฿{subtotal.toFixed(2)}" readonly />
				<span>ภาษี</span><input type="text" value="฿0.00" readonly />
				<span>ส่วนลด</span><input type="text" value="฿{totalDiscount.toFixed(2)}" readonly />
				<label for="billDiscount">ท้ายบิล</label>
				<input type="number" id="billDiscount" placeholder="0.00" bind:value="{billDiscount}" min="0" />
				<span class="total-label">รวม</span>
				<input type="text" class="total-input" value="฿{grandTotal.toFixed(2)}" readonly />
			</div>

			<footer class="summary-footer">
				<button
					class="checkout-btn main-action-btn"
					disabled="{cart.length === 0}"
					on:click="{() => (showPaymentModal = true)}">คิดเงิน</button
				>
				<div class="sub-footer-buttons">
					<button class="secondary" on:click="{handleHoldBill}" disabled="{cart.length === 0}">พักบิล</button>
					<button class="danger-solid" on:click="{resetSale}">ยกเลิก</button>
				</div>
			</footer>
		</article>
	</div>
</div>

<PaymentModal
	bind:showModal="{showPaymentModal}"
	totalAmount="{grandTotal}"
	on:confirm="{handleCheckout}"
	on:close="{() => (showPaymentModal = false)}"
/>
<HeldBillsModal
	bind:showModal="{showHeldBillsModal}"
	on:select="{(event) => loadHeldBill(event.detail)}"
	on:close="{() => (showHeldBillsModal = false)}"
/>

<SaleSuccessModal 
    bind:showModal={showSaleSuccessModal}
    newOrderId={newOrderId}
    on:closeAndReset={closeSuccessModalAndReset}
/>

<style>
:root {
	--main-green: #28e132;
	--main-green-hover: #22c52a;
	--text-color-on-main: #ffffff;
	--danger-red: #f44336;
	--danger-red-hover: #d32f2f;
}

/* --- Main Action Button Styles --- */
.main-action-btn {
	--pico-background-color: var(--main-green);
	--pico-border-color: var(--main-green);
	--pico-color: var(--text-color-on-main);
}
.main-action-btn:hover,
.main-action-btn:active,
.main-action-btn:focus {
	--pico-background-color: var(--main-green-hover);
	--pico-border-color: var(--main-green-hover);
}
/* --- Danger Red Button Styles --- */
.danger-solid {
	--pico-background-color: var(--danger-red);
	--pico-border-color: var(--danger-red);
	--pico-color: var(--text-color-on-main);
}
.danger-solid:hover,
.danger-solid:active,
.danger-solid:focus {
	--pico-background-color: var(--danger-red-hover);
	--pico-border-color: var(--danger-red-hover);
}

/* --- Layout & General Card Styles --- */
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
	background-color: white;
	color: black;
	border-bottom: 1px solid var(--pico-card-border-color);
	cursor: pointer;
}
.customer-item:last-child,
.product-item:last-child {
	border-bottom: none;
}
.customer-item:hover,
.product-item:hover,
.product-item.highlighted {
	background-color: var(--pico-primary-background);
	color: white;
}
.customer-info-text {
	flex-grow: 1;
	margin-right: 1rem;
}
.customer-address {
	margin-top: 0.5rem;
	font-size: 0.9em;
	color: var(--pico-muted-color);
	white-space: pre-wrap;
}
.customer-display {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	background-color: var(--pico-muted-background-color);
	padding: 0.75rem 1rem;
	border-radius: var(--pico-border-radius);
}

/* --- Table Styles --- */
.table-container {
	max-height: 45vh;
	overflow-y: auto;
	margin-top: 1.5rem;
}
table {
	margin-bottom: 0;
	table-layout: fixed;
	width: 100%;
}
thead th,
tbody td {
	text-align: center !important;
	vertical-align: middle !important;
}

/* --- ช่องชื่อสินค้า: ชิดซ้ายแต่เว้นขอบ --- */
.table-container th:nth-child(2),
.table-container td:nth-child(2) {
	text-align: left !important;
	padding-left: 18px !important;
}

/* ช่องอื่น ๆ เช่น .td-center, .td-right ให้ตรงกลางหมด */
.td-center, .td-right {
	text-align: center !important;
}

.table-container tr {
	height: 42px;
}
.empty-row {
	text-align: center;
	padding: 2rem;
	color: var(--pico-muted-color);
}

/* --- Input & Quantity Control Styles --- */
/* Input ของจำนวน, ราคา, ส่วนลด สูงขึ้น, ขนาดเท่ากัน, ตัวเลขกลางแนวตั้ง */
.quantity-input,
.price-input,
.discount-input {
	width: 1200px;
	min-width: 70px;
	max-width: 200px;
	height: 40px;
	padding: 0 .5rem;
	font-size: 1em;
	text-align: center;
	box-sizing: border-box;
	display: inline-block;
	margin: 0 auto;
	line-height: 38px;
}

/* กล่องควบคุมจำนวนสูงขึ้น */
.quantity-control {
	display: inline-flex;
	align-items: center;
	border: 1px solid var(--pico-form-element-border-color);
	border-radius: var(--pico-border-radius);
	max-width: 150px;
	width: 90px;
	min-width: 70px;
	height: 38px;
	margin: 0 auto;
	overflow: hidden;
}

/* Spinner ตั้งความสูงให้ปุ่มเท่ากับ input */
.spinner-buttons {
	display: flex;
	flex-direction: column;
	width: 24px;
	min-width: 24px;
	max-width: 24px;
	height: 38px;
}
.spinner-buttons button {
	padding: 0;
	line-height: 1;
	height: 19px;
	border-radius: 0;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 0.7em;
	background-color: var(--pico-secondary-background-color);
	color: var(--pico-secondary-color);
}
.spinner-buttons button:hover {
	background-color: var(--pico-secondary-hover-background-color);
}
.spinner-buttons .spinner-up {
	border-bottom: 1px solid var(--pico-form-element-border-color);
}
.small-btn {
	padding: 0.25rem 0.5rem;
	line-height: 1;
}

/* --- Summary Panel Styles --- */
.price-input, .discount-input {
	width: 110px;
	min-width: 70px;
	max-width: 150px;
	text-align: center;
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
.summary-header {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.75rem;
	margin-bottom: 1.5rem;
	padding-bottom: 1rem;
	border-bottom: 1px solid var(--pico-muted-border-color);
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
	color: var(--pico-muted-color);
}
.summary-header button {
	width: 100%;
}
.price-summary {
	width: 100px
	display: grid;
	grid-template-columns: auto 1fr;
	gap: 0.75rem;
	align-items: center;
}
.price-summary input {
	text-align: right;
	border-radius: 20px;
	padding: 0.5rem 1rem;
}


</style>