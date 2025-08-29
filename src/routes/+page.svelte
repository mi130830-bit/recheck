// Path: src/routes/+page.svelte (SCRIPT SECTION - FINAL CORRECTED VERSION)
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Product, Customer, Order, OrderItem } from '@prisma/client';
	import PaymentModal from '$lib/components/PaymentModal.svelte';
	import HeldBillsModal from '$lib/components/HeldBillsModal.svelte';

type FullOrder = Order & { customer: Customer | null; items: (OrderItem & { product: Product })[] };

// --- State ไม่เปลี่ยนแปลง ---
let productSearchQuery = '';
let customerSearchQuery = '';
let productSearchResults: Product[] = [];
let customerSearchResults: Customer[] = [];
let cart: (Product & { quantity: number; discount: number })[] = [];
let selectedCustomer: Customer | null = null;
let isLoading = false;
let productDebounceTimer: number;
let customerDebounceTimer: number;
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

// --- onMount/onDestroy ไม่เปลี่ยนแปลง ---
onMount(async () => {
	timer = setInterval(() => {
		const now = new Date();
		currentDate = now.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric', calendar: 'buddhist' });
		currentTime = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
	}, 1000);
	const now = new Date();
	currentDate = now.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric', calendar: 'buddhist' });
	currentTime = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
	try {
		const response = await fetch('/api/orders/hold');
		if (response.ok) {
			const heldBills = await response.json();
			heldBillsCount = heldBills.length;
		}
	} catch (err) {
		console.error("Failed to fetch held bills count:", err);
	}
});

onDestroy(() => {
	clearInterval(timer);
});

// --- ฟังก์ชันพื้นฐานไม่เปลี่ยนแปลง ---
function handleProductSearchInput() { clearTimeout(productDebounceTimer); productDebounceTimer = setTimeout(() => searchProducts(), 300); }
async function searchProducts() { highlightedIndex = -1; if (productSearchQuery.trim().length === 0) { productSearchResults = []; return; } isLoading = true; try { const response = await fetch(`/api/products/search?q=${encodeURIComponent(productSearchQuery)}`); if (response.ok) productSearchResults = await response.json(); } finally { isLoading = false; } }
function handleCustomerSearchInput() { clearTimeout(customerDebounceTimer); customerDebounceTimer = setTimeout(() => searchCustomers(), 300); }
async function searchCustomers() { if (customerSearchQuery.trim().length === 0) { customerSearchResults = []; return; } isLoading = true; try { const response = await fetch(`/api/customers/search?q=${encodeURIComponent(customerSearchQuery)}`); if (response.ok) customerSearchResults = await response.json(); } finally { isLoading = false; } }
function selectCustomer(customer: Customer) { selectedCustomer = customer; customerSearchQuery = ''; customerSearchResults = []; }
function clearSelectedCustomer() { selectedCustomer = null; }
function addToCart(product: Product, quantity = 1) { const existingItem = cart.find((item) => item.id === product.id); if (existingItem) { existingItem.quantity += quantity; } else { cart = [...cart, { ...product, quantity: quantity, discount: 0 }]; } cart = [...cart]; productSearchQuery = ''; productSearchResults = []; highlightedIndex = -1; }
function removeFromCart(productId: number) { cart = cart.filter((item) => item.id !== productId); }
function adjustQuantity(productId: number, amount: number) { const item = cart.find((i) => i.id === productId); if (item) { const newQuantity = item.quantity + amount; if (newQuantity > 0) { item.quantity = newQuantity; cart = [...cart]; } else { removeFromCart(productId); } } }
function updateQuantity(itemIndex: number, newQuantityStr: string) { const newQuantity = parseInt(newQuantityStr) || 1; if (newQuantity > 0) { cart[itemIndex].quantity = newQuantity; cart = [...cart]; } }
function handleKeydown(event: KeyboardEvent) { if (productSearchResults.length === 0) return; if (event.key === 'ArrowDown') { event.preventDefault(); highlightedIndex = (highlightedIndex + 1) % productSearchResults.length; } else if (event.key === 'ArrowUp') { event.preventDefault(); highlightedIndex = (highlightedIndex - 1 + productSearchResults.length) % productSearchResults.length; } else if (event.key === 'Enter') { event.preventDefault(); if (highlightedIndex !== -1) { addToCart(productSearchResults[highlightedIndex]); } else if (productSearchResults.length > 0) { addToCart(productSearchResults[0]); } } }

// ===================== [แก้ไข] ฟังก์ชัน handleCheckout =====================
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
			// [เพิ่ม] ส่ง ID ของบิลที่พักไว้ที่กำลังจะถูกแทนที่ไปด้วย
			heldBillIdToDelete: loadedHeldBillId
		};

		const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
		
		if (response.ok) {
			const newOrder = await response.json();
			newOrderId = newOrder.id;
			showSaleSuccessModal = true;
			// [เพิ่ม] ถ้าเคยมีบิลพักไว้ จำนวนจะถูกลดที่ server แต่เราอัปเดต UI ที่นี่
			if(loadedHeldBillId) {
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

// --- handleHoldBill ไม่เปลี่ยนแปลง ---
async function handleHoldBill() {
	if (cart.length === 0) return;
	isLoading = true;
	try {
		const payload = {
			cart: cart.map((item) => ({
				id: item.id,
				quantity: item.quantity,
				discount: item.discount,
				// [เพิ่ม] ส่ง retailPrice ไปด้วยเผื่อ API ต้องการ
				retailPrice: item.retailPrice
			})),
			customerId: selectedCustomer ? selectedCustomer.id : null
		};
		const response = await fetch('/api/orders/hold', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
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

// ===================== [แก้ไข] ฟังก์ชัน resetSale =====================
async function resetSale() {
	// [เพิ่ม] ถ้ากำลังเคลียร์ตะกร้าที่มีบิลพักไว้โหลดอยู่ ให้ลบบิลนั้นทิ้ง
	if (loadedHeldBillId) {
		try {
			await fetch(`/api/orders/hold/${loadedHeldBillId}`, { method: 'DELETE' });
			heldBillsCount--; // ลดจำนวนบนปุ่ม
		} catch (err) {
			console.error("Failed to delete held bill on reset:", err);
		}
	}
	
	cart = [];
	productSearchQuery = '';
	customerSearchQuery = '';
	productSearchResults = [];
	customerSearchResults = [];
	selectedCustomer = null;
	loadedHeldBillId = null; // รีเซ็ต ID ทุกครั้ง
	highlightedIndex = -1;
}

// --- loadHeldBill ไม่เปลี่ยนแปลง ---
function loadHeldBill(order: FullOrder) {
	// resetSale จะถูกเรียกใช้โดยอัตโนมัติถ้ามี loadedHeldBillId อยู่แล้ว
	// เพื่อลบของเก่าก่อนโหลดของใหม่
	if(loadedHeldBillId) {
		resetSale();
	}

	selectedCustomer = order.customer;
	// [แก้ไข] แปลงค่า String จาก API กลับเป็น Number ตอนโหลดเข้าตะกร้า
	const newCart = order.items.map(item => ({
		...item.product,
		retailPrice: Number(item.product.retailPrice), // แปลงค่าหลัก
		costPrice: Number(item.product.costPrice),
		wholesalePrice: item.product.wholesalePrice ? Number(item.product.wholesalePrice) : null,
		quantity: item.quantity,
		discount: Number(item.discount || 0)
	}));
	cart = newCart;
	loadedHeldBillId = order.id;
	showHeldBillsModal = false;
}

// --- closeSuccessModalAndReset ไม่เปลี่ยนแปลง ---
function closeSuccessModalAndReset() {
	showSaleSuccessModal = false;
	newOrderId = null;
	resetSale();
}

// --- Reactive statements ไม่เปลี่ยนแปลง ---
$: subtotal = cart.reduce((sum, item) => sum + Number(item.retailPrice) * item.quantity, 0);
$: totalDiscount = cart.reduce((sum, item) => sum + Number(item.discount || 0) * item.quantity, 0);
$: grandTotal = subtotal - totalDiscount;
</script>

<div class="pos-grid" class:loading={isLoading}>
	<!-- ==== คอลัมน์ซ้าย (Main Panel) ==== -->
	<div class="main-panel">
		<article class="customer-card">
			<header><strong>ข้อมูลสมาชิก</strong></header>
			<div class="customer-section">
				{#if selectedCustomer}
					<div class="customer-display">
						<span><strong>ชื่อ:</strong> {selectedCustomer.firstName} {selectedCustomer.lastName || ''} ({selectedCustomer.phone || selectedCustomer.memberCode})</span>
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
										{customer.firstName} {customer.lastName || ''} - {customer.phone || customer.memberCode}
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
					bind:value={productSearchQuery}
					on:input={handleProductSearchInput}
					on:keydown={handleKeydown}
				/>
				{#if productSearchResults.length > 0}
					<div class="search-dropdown">
						{#each productSearchResults as product, i (product.id)}
							<button
								class="product-item"
								class:highlighted={i === highlightedIndex}
								on:click={() => addToCart(product)}
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
							<th>ที่</th>
							<th>บาร์โค้ด</th>
							<th>ชื่อสินค้า</th>
							<th>จำนวน</th>
							<th>ราคา</th>
							<th>ส่วนลด/หน่วย</th>
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
											<input type="number" class="quantity-input" value={item.quantity} min="1" on:input={(e) => updateQuantity(i, e.currentTarget.value)} />
											<button on:click={() => adjustQuantity(item.id, 1)} class="outline secondary small-btn">+</button>
										</div>
									</td>
									<td>{parseFloat(item.retailPrice).toFixed(2)}</td>
									<td><input type="number" bind:value={item.discount} min="0" class="discount-input" /></td>
									<td>{((Number(item.retailPrice) - Number(item.discount || 0)) * item.quantity).toFixed(2)}</td>
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
				<div class="date-time-section">
					<strong class="date">{currentDate || '...'}</strong>
					<span class="time">{currentTime || '...'}</span>
				</div>
				<button class="secondary outline" on:click={() => (showHeldBillsModal = true)}>
					{heldBillsCount} รายการพักบิล
				</button>
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

<PaymentModal bind:showModal={showPaymentModal} totalAmount={grandTotal} on:confirm={handleCheckout} on:close={() => (showPaymentModal = false)} />
<HeldBillsModal bind:showModal={showHeldBillsModal} on:select={(event) => loadHeldBill(event.detail)} on:close={() => (showHeldBillsModal = false)} />

{#if showSaleSuccessModal}
	<dialog open>
		<article>
			<header>
				<a href="#close" aria-label="Close" class="close" on:click|preventDefault={closeSuccessModalAndReset}></a>
				<strong>✅ บันทึกการขายสำเร็จ!</strong>
			</header>
			<p>คุณต้องการพิมพ์ใบเสร็จหรือไม่?</p>
			<footer>
				<div class="grid">
					<a href="/receipts/{newOrderId}?size=a4" target="_blank" role="button" class="secondary">พิมพ์ (A4)</a>
					<a href="/receipts/{newOrderId}?size=a5" target="_blank" role="button" class="secondary">พิมพ์ (A5)</a>
					<a href="/receipts/{newOrderId}?size=slip" target="_blank" role="button" class="secondary outline">พิมพ์ (สลิป)</a>
				</div>
				<hr>
				<button on:click={closeSuccessModalAndReset}>เริ่มการขายใหม่</button>
			</footer>
		</article>
	</dialog>
{/if}

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
		margin-top: 1.5rem;
	}
	table {
		margin-bottom: 0;
	}
	.empty-row {
		text-align: center;
		padding: 2rem;
		color: var(--pico-muted-color);
	}
	tbody td {
		vertical-align: middle;
	}
	.quantity-control {
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: 0.5rem;
	}
	.small-btn {
		padding: 0.25rem 0.5rem;
		line-height: 1;
	}
	.quantity-input {
		width: 80px;
		text-align: center;
		border: none;
		background-color: transparent;
		padding: 0.25rem 0;
		line-height: 1;
		-moz-appearance: textfield;
	}
	.quantity-input::-webkit-outer-spin-button,
	.quantity-input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	.discount-input {
		max-width: 80px;
		text-align: right;
		padding: 0.25rem 0.5rem;
		height: auto;
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