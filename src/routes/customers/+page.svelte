<!-- Path: src/routes/customers/+page.svelte (เพิ่มปุ่มประวัติ) -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	$: ({ customers, totalItems, currentPage, totalPages, query } = data);
	let searchQuery = data.query ?? '';
	let debounceTimer: NodeJS.Timeout;

	function handleSearchInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			const params = new URLSearchParams($page.url.searchParams.toString());
			params.set('query', searchQuery);
			params.set('page', '1');
			goto(`?${params.toString()}`, {
				keepFocus: true,
				noScroll: true,
				replaceState: true
			});
		}, 300);
	}
</script>

<main class="container">
	<header class="header-container">
		<h1>จัดการข้อมูลสมาชิก</h1>
		<div class="button-group">
			<a href="/customers/import" role="button" class="excel-btn">
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<rect x="3" y="3" width="18" height="18" rx="2" />
					<text x="7" y="16" font-size="7" font-family="Arial">XLS</text>
				</svg>
				นำเข้าจาก Excel
			</a>
			<a href="/customers/new" role="button" class="add-btn"> + เพิ่มสมาชิกใหม่ </a>
		</div>
	</header>

	<div class="search-form">
		<input
			type="search"
			name="query"
			placeholder="พิมพ์เพื่อค้นหาจากรหัส, ชื่อ, หรือเบอร์โทร..."
			bind:value={searchQuery}
			on:input={handleSearchInput}
			class="search-input"
			aria-label="ค้นหาข้อมูลสมาชิก"
		/>
	</div>

	{#if form?.message}
		<aside class="error-message"><p>{form.message}</p></aside>
	{/if}

	{#if customers.length === 0}
		<article><p>ไม่พบข้อมูลสมาชิกที่ตรงกับเงื่อนไข</p></article>
	{:else}
		<div style="overflow-x: auto;">
			<table>
				<thead>
					<tr>
						<th>รหัสสมาชิก</th>
						<th>ชื่อ - นามสกุล</th>
						<th>โทรศัพท์</th>
						<th>อีเมล</th>
						<!-- START: แก้ไขความกว้างคอลัมน์ -->
						<th style="width: 180px;">การกระทำ</th>
						<!-- END: แก้ไขความกว้างคอลัมน์ -->
					</tr>
				</thead>
				<tbody>
					{#each customers as customer (customer.id)}
						<tr>
							<td><strong>{customer.memberCode}</strong></td>
							<td>{customer?.firstName} {customer?.lastName || ''}</td>
							<td>{customer.phone || '-'}</td>
							<td>{customer.email || '-'}</td>
							<td>
								<div class="action-buttons">
									<a
										href="/customers/{customer.id}/edit"
										role="button"
										class="outline mint-outline"
										title="แก้ไข"
										aria-label="แก้ไข"
									>
										<svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<path d="M12 20h9" />
											<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
										</svg>
									</a>

									<!-- START: เพิ่มปุ่ม "..." สำหรับดูประวัติ -->
									<a
										href="/customers/{customer.id}/history"
										role="button"
										class="secondary outline"
										title="ดูประวัติการซื้อ"
										aria-label="ดูประวัติการซื้อ"
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
										>
											<circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle
												cx="5"
												cy="12"
												r="1"
											/>
										</svg>
									</a>
									<!-- END: เพิ่มปุ่ม "..." สำหรับดูประวัติ -->

									<form method="POST" action="?/delete" use:enhance>
										<input type="hidden" name="id" value={customer.id} />
										<button
											type="submit"
											class="outline danger-outline"
											title="ลบ"
											aria-label="ลบ"
											on:click={(event) => {
												if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${customer?.firstName}"?`)) {
													event.preventDefault();
												}
											}}
										>
											<svg
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											>
												<polyline points="3 6 5 6 21 6" />
												<path
													d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
												/>
												<line x1="10" y1="11" x2="10" y2="17" />
												<line x1="14" y1="11" x2="14" y2="17" />
											</svg>
										</button>
									</form>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		{#if totalPages > 1}
			<nav class="pagination">
				<ul>
					<li>
						<a
							href="?query={searchQuery}&page={currentPage - 1}"
							aria-label="Previous"
							class:disabled={currentPage <= 1}>&laquo; ก่อนหน้า</a
						>
					</li>
					<li><span>หน้า {currentPage} / {totalPages}</span></li>
					<li>
						<a
							href="?query={searchQuery}&page={currentPage + 1}"
							aria-label="Next"
							class:disabled={currentPage >= totalPages}>ถัดไป &raquo;</a
						>
					</li>
				</ul>
			</nav>
		{/if}
	{/if}
</main>

<style>
	/* === 1. المتغيراتสีหลัก === */
	:root {
		--mint-green: #15cb24;
		--mint-green-hover: #26c217;
		--mint-green-light: #f0fafa;
		--text-color-on-mint: #ffffff;
		--danger-red: #c62828;
		--danger-red-hover: #b71c1c;
		--danger-red-light: #ffcdd2;
	}

	/* === 2. Layout ของส่วนหัว === */
	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		margin-top: 1rem;
	}
	.header-container h1 {
		margin-bottom: 0;
		font-size: 1.75rem;
	}
	.button-group {
		display: flex;
		gap: 0.5rem;
	}

	/* === 3. สไตล์ปุ่มบนส่วนหัว === */
	.add-btn {
		--pico-background-color: var(--mint-green);
		--pico-border-color: var(--mint-green);
		--pico-color: var(--text-color-on-mint);
	}
	.add-btn:hover,
	.add-btn:active,
	.add-btn:focus {
		--pico-background-color: var(--mint-green-hover);
		--pico-border-color: var(--mint-green-hover);
	}
	.excel-btn {
		--pico-background-color: transparent;
		--pico-border-color: var(--mint-green);
		--pico-color: var(--mint-green);
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}
	.excel-btn:hover,
	.excel-btn:active,
	.excel-btn:focus {
		--pico-background-color: var(--mint-green-light);
		--pico-border-color: var(--mint-green-hover);
		--pico-color: var(--mint-green-hover);
	}

	/* === 4. ความมนของปุ่มบนส่วนหัว === */
	.add-btn,
	.excel-btn {
		border-radius: 20px;
	}

	/* === 5. สไตล์ปุ่ม Action ในตาราง === */
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
	.mint-outline.outline {
		--pico-background-color: transparent;
		--pico-border-color: var(--mint-green);
		--pico-color: var(--mint-green);
	}
	.mint-outline.outline:hover,
	.mint-outline.outline:active,
	.mint-outline.outline:focus {
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

	/* === สไตล์อื่นๆ ที่มีอยู่แล้ว === */
	.search-form {
		margin-bottom: 1.5rem;
	}
	.error-message {
		background-color: var(--pico-form-element-invalid-background-color);
		color: var(--pico-form-element-invalid-color);
		border: 1px solid var(--pico-form-element-invalid-border-color);
		padding: 0.5rem 1rem;
		margin-bottom: 1rem;
		border-radius: var(--pico-border-radius);
	}
	.error-message p {
		margin: 0;
	}
	.pagination {
		margin-top: 1.5rem;
	}
	.pagination ul {
		justify-content: center;
	}
</style>