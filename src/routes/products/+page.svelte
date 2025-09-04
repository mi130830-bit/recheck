<!-- src/routes/products/+page.svelte (ปรับปรุงใหม่ - ไม่มีรูปภาพ) -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	export let data: PageData;
	export let form;

	$: ({ products, totalItems, currentPage, totalPages, query, limit } = data);
	let searchQuery = query ?? '';
	let debounceTimer: NodeJS.Timeout;

	function handleSearchInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			const params = new URLSearchParams($page.url.searchParams.toString());
			params.set('query', searchQuery);
			params.set('page', '1');
			goto(`?${params.toString()}`, { keepFocus: true, noScroll: true, replaceState: true });
		}, 300);
	}
</script>

<main class="container">
	<header class="header-container">
		<h1>รายการสินค้า ({totalItems} รายการ)</h1>
		<div class="button-group">
			<a href="/products/import" role="button" class="secondary outline mint-outline"
				>นำเข้าจาก Excel</a
			>
			<a href="/products/new" role="button" class="mint-solid">+ เพิ่มสินค้าใหม่</a>
		</div>
	</header>

	<div class="search-container">
		<label for="search-input">ค้นหาสินค้า</label>
		<input
			id="search-input"
			type="search"
			name="query"
			placeholder="บาร์โค้ด, ชื่อสินค้า..."
			bind:value={searchQuery}
			on:input={handleSearchInput}
		/>
	</div>

	{#if form?.message}
		<aside class="error-message">
			<p>{form.message}</p>
		</aside>
	{/if}

	{#if products.length === 0}
		<article><p>ไม่พบข้อมูลสินค้าที่ตรงกับเงื่อนไขการค้นหา</p></article>
	{:else}
		<div style="overflow-x: auto;">
			<table>
				<thead>
					<tr>
						<!-- ✅ REMOVE: ลบ Header 'รูปภาพ' ออก -->
						<th style="width: 5%;">ลำดับที่</th>
						<th style="width: 20%;">บาร์โค้ด</th>
						<th>ชื่อสินค้า</th>
						<th style="text-align: center; width: 15%;">จำนวนคงเหลือ</th>
						<th style="text-align: right; width: 15%;">ราคาปลีก (บาท)</th>
						<th style="width: 180px;">การกระทำ</th>
					</tr>
				</thead>
				<tbody>
					{#each products as product, i (product.id)}
						<tr>
							<!-- ✅ REMOVE: ลบข้อมูลแถว 'รูปภาพ' ออก -->
							<td>{(currentPage - 1) * limit + i + 1}</td>
							<td>{product.barcode || '-'}</td>
							<td><strong>{product.name}</strong></td>
							<td style="text-align: center;">{product.stockQuantity}</td>
							<td style="text-align: right;">{product.retailPrice.toFixed(2)}</td>
							<td>
								<div class="action-buttons">
									<a
										href="/products/{product.id}/edit"
										role="button"
										class="outline mint-outline"
										title="แก้ไข"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											><path d="M12 20h9" /><path
												d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
											/></svg
										>
									</a>

									<a
										href="/products/{product.id}"
										role="button"
										class="secondary outline"
										title="ดูรายละเอียดสินค้า"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle
												cx="5"
												cy="12"
												r="1"
											/></svg
										>
									</a>

									<form method="POST" action="?/delete" use:enhance>
										<input type="hidden" name="id" value={product.id} />
										<button
											type="submit"
											class="outline danger-outline"
											title="ลบ"
											on:click={(e) => {
												if (!confirm(`ยืนยันการลบ "${product.name}"?`)) e.preventDefault();
											}}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												><polyline points="3 6 5 6 21 6" /><path
													d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
												/><line x1="10" y1="11" x2="10" y2="17" /><line
													x1="14"
													y1="11"
													x2="14"
													y2="17"
												/></svg
											>
										</button>
									</form>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</main>

<style>
	/* ✅ REMOVE: ลบ Style ของ .product-thumbnail ออก */

	:root {
		--mint-green: #15cb24;
		--mint-green-hover: #26c217;
		--mint-green-light: #f0fafa;
		--text-color-on-mint: #ffffff;
		--danger-red: #c62828;
		--danger-red-hover: #b71c1c;
		--danger-red-light: #ffcdd2;
	}

	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		margin-top: 1rem;
	}

	.header-container h1 {
		margin-bottom: 0;
	}
	.button-group {
		display: flex;
		gap: 0.5rem;
	}
	.search-container {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	.search-container label {
		margin-bottom: 0;
		white-space: nowrap;
	}
	.search-container input {
		margin-bottom: 0;
		max-width: 400px;
	}

	.action-buttons {
		display: flex;
		gap: 0.5rem;
		align-items: stretch;
		height: 40px;
	}

	.action-buttons > * {
		flex: 1 1 0;
		min-width: 0;
		height: 100%;
		padding: 0;
		margin-bottom: 0;
	}

	.action-buttons a[role='button'],
	.action-buttons button {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		min-width: 0;
		padding: 0;
		box-sizing: border-box;
		border-radius: 20px;
	}

	.action-buttons form {
		flex: 1 1 0;
		height: 100%;
		display: flex;
	}

	.action-buttons form button {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0;
		min-width: 0;
	}
	.mint-solid,
	.mint-outline {
		border-radius: 20px;
	}

	.mint-solid {
		--pico-background-color: var(--mint-green);
		--pico-border-color: var(--mint-green);
		--pico-color: var(--text-color-on-mint);
	}
	.mint-solid:hover,
	.mint-solid:active,
	.mint-solid:focus {
		--pico-background-color: var(--mint-green-hover);
		--pico-border-color: var(--mint-green-hover);
	}
	.mint-outline.outline,
	.mint-outline.secondary.outline {
		--pico-background-color: transparent;
		--pico-border-color: var(--mint-green);
		--pico-color: var(--mint-green);
	}
	.mint-outline.outline:hover,
	.mint-outline.outline:active,
	.mint-outline.outline:focus,
	.mint-outline.secondary.outline:hover,
	.mint-outline.secondary.outline:active,
	.mint-outline.secondary.outline:focus {
		--pico-background-color: var(--mint-green-light);
		--pico-border-color: var(--mint-green-hover);
		--pico-color: var(--mint-green-hover);
	}
	.danger-outline.outline {
		--pico-background-color: transparent;
		--pico-border-color: var(--danger-red);
		--pico-color: var(--danger-red);
	}
	.danger-outline.outline:hover,
	.danger-outline.outline:active,
	.danger-outline.outline:focus {
		--pico-background-color: var(--danger-red-light);
		--pico-border-color: var(--danger-red-hover);
		--pico-color: var(--danger-red-hover);
	}
	.error-message {
		background-color: var(--pico-form-element-invalid-background-color);
		border: 1px solid var(--pico-form-element-invalid-border-color);
		color: var(--pico-form-element-invalid-color);
		padding: 0.5rem 1rem;
		margin-bottom: 1rem;
		border-radius: var(--pico-border-radius);
	}
	.error-message p {
		margin: 0;
	}
</style>