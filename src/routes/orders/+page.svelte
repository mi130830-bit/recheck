<!-- src/routes/orders/+page.svelte (แก้ไขแล้ว) -->
<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	// [แก้ไข] 1. ใช้ $props() เพื่อรับ data prop
	let { data } = $props<PageData>();

	// [ปรับปรุง] 2. ใช้ $derived เพื่อให้ตัวแปร update อัตโนมัติและป้องกัน error
	let orders = $derived(data.orders || []);

	// [ปรับปรุง] 3. เพิ่ม state สำหรับการค้นหา
	let searchQuery = $state(data.query || '');

	// [ปรับปรุง] 4. เพิ่ม Debounce search effect
	$effect(() => {
		const handler = setTimeout(() => {
			const currentQuery = $page.url.searchParams.get('query') ?? '';
			if (searchQuery !== currentQuery) {
				const params = new URLSearchParams($page.url.searchParams);
				params.set('query', searchQuery);
				params.set('page', '1'); // กลับไปหน้า 1 เสมอเมื่อค้นหาใหม่
				goto(`?${params.toString()}`, { keepFocus: true, noScroll: true, replaceState: true });
			}
		}, 300);

		return () => clearTimeout(handler);
	});
</script>

<svelte:head>
	<title>รายการบิลขาย</title>
</svelte:head>

<main class="container">
	<header class="page-header">
		<h1>รายการบิลขาย</h1>
		<a href="/pos" role="button">สร้างบิลใหม่</a>
	</header>

	<input type="search" placeholder="ค้นหาตามเลขที่บิล, ชื่อลูกค้า..." bind:value={searchQuery} />

	{#if orders.length > 0}
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>เลขที่บิล</th>
						<th>วันที่</th>
						<th>ลูกค้า</th>
						<th>สถานะ</th>
						<th class="right">ยอดรวม</th>
						<th class="actions"></th>
					</tr>
				</thead>
				<tbody>
					<!-- [แก้ไข] 5. เปลี่ยน Key ของ Loop เป็น (order.id) ซึ่งปลอดภัยและมีอยู่เสมอ -->
					{#each orders as order (order.id)}
						<tr>
							<td><strong>{order.orderNumber}</strong></td>
							<td>
								{new Date(order.createdAt).toLocaleString('th-TH', {
									dateStyle: 'short',
									timeStyle: 'short'
								})}
							</td>
							<td>
								{order.customer ? `${order.customer.firstName} ${order.customer.lastName || ''}` : 'ลูกค้าทั่วไป'}
							</td>
							<td><span class="status-{order.status.toLowerCase()}">{order.status}</span></td>
							<td class="right">{order.total.toFixed(2)}</td>
							<td class="actions">
								<a href="/orders/{order.id}" title="ดูรายละเอียด">👁️</a>
								<a href="/receipts/{order.id}?size=slip" target="_blank" title="พิมพ์ใบเสร็จ">🖨️</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		<nav>
			<ul>
				<li>
					{#if data.currentPage > 1}
						<a href="?page={data.currentPage - 1}&query={data.query}" aria-label="Previous">
							&laquo;
						</a>
					{:else}
						<span aria-disabled="true">&laquo;</span>
					{/if}
				</li>
			</ul>
			<ul>
				<li>Page {data.currentPage} of {data.totalPages}</li>
			</ul>
			<ul>
				<li>
					{#if data.currentPage < data.totalPages}
						<a href="?page={data.currentPage + 1}&query={data.query}" aria-label="Next">
							&raquo;
						</a>
					{:else}
						<span aria-disabled="true">&raquo;</span>
					{/if}
				</li>
			</ul>
		</nav>
	{:else}
		<article class="no-results">
			<p>ไม่พบข้อมูลบิล</p>
		</article>
	{/if}
</main>

<style>
	.container { max-width: 1024px; }
	.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
	.table-container { overflow-x: auto; }
	.right { text-align: right; }
	.actions { text-align: center; white-space: nowrap; }
	.actions a { margin: 0 0.25rem; }
	[class*='status-'] { padding: 0.25rem 0.5rem; border-radius: 99px; font-size: 0.8em; font-weight: bold; color: white; }
	.status-completed { background-color: #28a745; }
	.status-credit { background-color: #ffc107; color: black; }
	.status-held { background-color: #17a2b8; }
	.status-cancelled { background-color: #6c757d; }
	.no-results { text-align: center; padding: 2rem; }
</style>

