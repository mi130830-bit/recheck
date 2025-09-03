<!-- File: src/routes/stock-in/+page.svelte (แก้ไขให้ค้นหาได้) -->

<script lang="ts">
	import type { Product, Supplier } from '@prisma/client';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	export let data;

	// --- State เดิม ---
	type CartItem = Product & { receiveQty: number; receiveCost: number };
	let selectedSupplierId: number | null = null;
	let cart: CartItem[] = [];
	let notes = '';
	let isLoading = false;

	// --- State ใหม่สำหรับช่องค้นหา ---
	let supplierSearchText = '';
	let productSearchText = '';
	let isSupplierDropdownVisible = false;
	let isProductDropdownVisible = false;
	let selectedProductForCart: Product | null = null; // เก็บข้อมูล Product ทั้งหมดเพื่อเพิ่มลงตะกร้า

	// --- Reactive Statements สำหรับกรองข้อมูล ---
	$: filteredSuppliers = supplierSearchText
		? data.suppliers.filter((s) =>
				s.name.toLowerCase().includes(supplierSearchText.toLowerCase()) ||
				s.code?.toLowerCase().includes(supplierSearchText.toLowerCase())
			)
		: data.suppliers;

	$: filteredProducts = productSearchText
		? data.products.filter((p) =>
				p.name.toLowerCase().includes(productSearchText.toLowerCase()) ||
				p.barcode?.toLowerCase().includes(productSearchText.toLowerCase())
			)
		: data.products;

	// --- ฟังก์ชันใหม่สำหรับจัดการการเลือก ---
	function selectSupplier(supplier: Supplier) {
		selectedSupplierId = supplier.id;
		supplierSearchText = `${supplier.name} (${supplier.code})`; // แสดงชื่อที่เลือกใน input
		isSupplierDropdownVisible = false;
	}

	function selectProduct(product: Product) {
		selectedProductForCart = product;
		productSearchText = `${product.name} (${product.barcode || 'ไม่มีบาร์โค้ด'})`;
		isProductDropdownVisible = false;
	}

	// --- ฟังก์ชันเดิมที่ปรับปรุง ---
	function addProductToCart() {
		if (!selectedProductForCart) return;

		// ตรวจสอบว่าสินค้ายังไม่มีในรายการ
		if (!cart.find((item) => item.id === selectedProductForCart!.id)) {
			cart = [
				...cart,
				{
					...selectedProductForCart,
					receiveQty: 1,
					receiveCost: selectedProductForCart.costPrice
				}
			];
		}
		// Reset ค่าหลังเพิ่มเสร็จ
		selectedProductForCart = null;
		productSearchText = '';
	}

	function removeFromCart(productId: number) {
		cart = cart.filter((c) => c.id !== productId);
	}

	async function handleSave() {
		if (!selectedSupplierId || cart.length === 0) {
			alert('กรุณาเลือกผู้ขายและเพิ่มสินค้าอย่างน้อย 1 รายการ');
			return;
		}
		isLoading = true;
		try {
			const response = await fetch('/api/stock-in', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					supplierId: selectedSupplierId,
					items: cart,
					notes: notes
				})
			});

			if (response.ok) {
				alert('บันทึกการรับสินค้าสำเร็จ!');
				await goto('/products');
			} else {
				const err = await response.json();
				alert(`เกิดข้อผิดพลาด: ${err.error}`);
			}
		} catch (error) {
			console.error('Save stock-in error:', error);
			alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
		} finally {
			isLoading = false;
		}
	}

	$: totalCost = cart.reduce((sum, item) => sum + item.receiveCost * item.receiveQty, 0);
</script>

<main class="container">
	<article>
		<header>
			<h2>รับของเข้าคลัง / สร้างใบสั่งซื้อ</h2>
		</header>

		<div class="grid">
			<label for="supplier">
				<strong>1. เลือกผู้ขาย</strong>
				<!-- [แก้ไข] เปลี่ยนจาก select เป็น input ค้นหา -->
				<div class="search-container">
					<input
						type="text"
						id="supplier"
						placeholder="-- พิมพ์เพื่อค้นหาผู้ขาย --"
						bind:value={supplierSearchText}
						on:focus={() => (isSupplierDropdownVisible = true)}
						on:blur={() => setTimeout(() => (isSupplierDropdownVisible = false), 150)}
						on:input={() => (selectedSupplierId = null)}
						required
					/>
					{#if isSupplierDropdownVisible && filteredSuppliers.length > 0}
						<ul class="search-results">
							{#each filteredSuppliers as supplier (supplier.id)}
								<li on:click={() => selectSupplier(supplier)}>
									{supplier.name} ({supplier.code})
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</label>
		</div>

		<fieldset>
			<legend><strong>2. เพิ่มรายการสินค้า</strong></legend>
			<div class="product-adder">
				<!-- [แก้ไข] เปลี่ยนจาก select เป็น input ค้นหา -->
				<div class="search-container">
					<input
						type="text"
						placeholder="-- พิมพ์เพื่อค้นหาสินค้า --"
						bind:value={productSearchText}
						on:focus={() => (isProductDropdownVisible = true)}
						on:blur={() => setTimeout(() => (isProductDropdownVisible = false), 150)}
						on:input={() => (selectedProductForCart = null)}
					/>
					{#if isProductDropdownVisible && filteredProducts.length > 0}
						<ul class="search-results">
							{#each filteredProducts as product (product.id)}
								<li on:click={() => selectProduct(product)}>
									{product.name} ({product.barcode || 'ไม่มีบาร์โค้ด'})
								</li>
							{/each}
						</ul>
					{/if}
				</div>
				<button on:click={addProductToCart} disabled={!selectedProductForCart}>เพิ่มรายการ</button>
			</div>

			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th>สินค้า</th>
							<th style="width: 120px;">จำนวนรับเข้า</th>
							<th style="width: 150px;">ต้นทุน/หน่วย</th>
							<th style="width: 150px;">ราคารวม</th>
							<th style="width: 50px;">ลบ</th>
						</tr>
					</thead>
					<tbody>
						{#if cart.length === 0}
							<tr><td colspan="5" style="text-align:center;">-- ยังไม่มีรายการ --</td></tr>
						{:else}
							{#each cart as item (item.id)}
								<tr>
									<td>{item.name}</td>
									<td><input type="number" bind:value={item.receiveQty} min="1" /></td>
									<td><input type="number" step="0.01" bind:value={item.receiveCost} min="0" /></td>
									<td><strong>{(item.receiveQty * item.receiveCost).toFixed(2)}</strong></td>
									<td>
										<button on:click={() => removeFromCart(item.id)} class="contrast outline small-btn"
											>X</button
										>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
					<tfoot>
						<tr>
							<td colspan="3" style="text-align:right;"><strong>ต้นทุนรวมทั้งหมด</strong></td>
							<td colspan="2"><strong class="total-cost">{totalCost.toFixed(2)}</strong></td>
						</tr>
					</tfoot>
				</table>
			</div>
		</fieldset>

		<label for="notes"><strong>3. หมายเหตุ (ถ้ามี)</strong></label>
		<textarea bind:value={notes} id="notes" placeholder="เช่น เลขที่บิลอ้างอิงจากผู้ขาย..."></textarea>

		<footer>
			<button on:click={handleSave} aria-busy={isLoading} disabled={!selectedSupplierId || cart.length === 0}>
				{isLoading ? 'กำลังบันทึก...' : 'ยืนยันและบันทึกการรับสินค้า'}
			</button>
		</footer>
	</article>
</main>

<style>
	/* --- CSS ใหม่สำหรับช่องค้นหา --- */
	.search-container {
		position: relative;
	}
	.search-results {
		position: absolute;
		width: 100%;
		background-color: white;
		border: 1px solid #ccc;
		border-radius: var(--pico-border-radius);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		list-style: none;
		padding: 0;
		margin-top: 4px;
		max-height: 250px;
		overflow-y: auto;
		z-index: 100;
	}
	.search-results li {
		padding: 0.75rem 1rem;
		cursor: pointer;
	}
	.search-results li:hover {
		background-color: var(--pico-primary-background);
		color: var(--pico-primary-inverse);
	}
	/* --- จบ CSS ใหม่ --- */

	:root {
		--primary-light-blue: #a3e4a8;
		--primary-blue: #15cb24;
		--primary-blue-hover: #26c217;
		--white: #ffffff;
	}
	.container {
		max-width: 960px;
		margin: 0 auto;
	}
	.product-adder {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	.product-adder button {
		min-width: 150px;
		height: auto; /*ปรับให้ยืดหยุ่น*/
		font-size: 1.1rem;
		padding: 0.5rem 1.25rem;
		border-radius: 10px;
		display: flex;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		background-color: var(--primary-blue);
		color: var(--white);
		border: 1px solid var(--primary-blue);
		cursor: pointer;
		transition: background 0.2s, border 0.2s;
	}
	.product-adder button:hover {
		background-color: var(--primary-blue-hover);
		border-color: var(--primary-blue-hover);
	}
	.product-adder button:disabled {
		background-color: var(--primary-light-blue);
		border-color: var(--primary-light-blue);
		color: #ffffff;
		cursor: not-allowed;
	}
	footer button {
		width: 100%;
		height: 55px;
		font-size: 1.1rem;
		padding: 0.75rem 0;
		border-radius: 10px;
		display: flex;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		background-color: var(--primary-blue);
		color: var(--white);
		border: 1px solid var(--primary-blue);
		cursor: pointer;
		transition: background 0.2s, border 0.2s;
	}
	footer button:hover {
		background-color: var(--primary-blue-hover);
		border-color: var(--primary-blue-hover);
	}
	footer button:disabled {
		background-color: var(--primary-light-blue);
		border-color: var(--primary-light-blue);
		color: #fcfafa;
		cursor: not-allowed;
	}
	.table-container {
		overflow-y: auto;
		max-height: 40vh;
	}
	.small-btn {
		padding: 0.2rem;
		line-height: 1;
		width: 28px;
		height: 28px;
	}
	.total-cost {
		font-size: 1.2em;
		color: var(--pico-primary);
	}
</style>