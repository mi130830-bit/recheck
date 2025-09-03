<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;
	export let form; // รับ form action data

	// ทำให้ตัวแปร reactive กับข้อมูลที่เปลี่ยนไป
	$: ({ suppliers, query } = data);
	let searchQuery = query ?? '';
	let debounceTimer: NodeJS.Timeout;

	// ฟังก์ชันค้นหาแบบ Debounce
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
		<h1>จัดการข้อมูลผู้ขาย</h1>
		<div class="button-group">
			<a href="/suppliers/import" role="button" class="secondary outline mint-outline"
				>นำเข้าจาก Excel</a
			>
			<a href="/suppliers/new" role="button" class="mint-solid">+ เพิ่มผู้ขายใหม่</a>
		</div>
	</header>

	<div class="search-form">
		<input
			type="search"
			name="query"
			placeholder="พิมพ์เพื่อค้นหาจากรหัส, ชื่อผู้ขาย..."
			bind:value={searchQuery}
			on:input={handleSearchInput}
			class="search-input"
			aria-label="ค้นหาข้อมูลผู้ขาย"
		/>
	</div>

	{#if form?.message}
		<aside class="error-message"><p>{form.message}</p></aside>
	{/if}

	{#if suppliers.length === 0}
		<article><p>ยังไม่มีข้อมูลผู้ขายในระบบ หรือไม่พบข้อมูลที่ตรงกับเงื่อนไข</p></article>
	{:else}
		<div style="overflow-x: auto;">
			<table>
				<thead>
					<tr>
						<th>รหัส</th>
						<th>ชื่อผู้ขาย</th>
						<th>เบอร์โทรศัพท์</th>
						<th>Tax ID</th>
						<th style="width: 120px;">การกระทำ</th>
					</tr>
				</thead>
				<tbody>
					{#each suppliers as supplier (supplier.id)}
						<tr>
							<td><strong>{supplier.code}</strong></td>
							<td>{supplier.name}</td>
							<td>{supplier.phone || '-'}</td>
							<td>{supplier.taxId || '-'}</td>
							<td>
								<div class="action-buttons">
									<a
										href="/suppliers/{supplier.id}/edit"
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
									<form method="POST" action="?/delete" use:enhance>
										<input type="hidden" name="id" value={supplier.id} />
										<button
											type="submit"
											class="outline danger-outline"
											title="ลบ"
											aria-label="ลบ"
											on:click={(event) => {
												if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${supplier.name}"?`)) {
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

	/* === 4. ความมนของปุ่มบนส่วนหัว === */
	.mint-solid,
	.mint-outline {
		border-radius: 20px;
	}

	/* === 5. สไตล์ปุ่ม Action ในตาราง (ส่วนที่เพิ่มใหม่) === */
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

	/* === สไตล์อื่นๆ === */
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
</style>