<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Order, OrderItem, Product } from '@prisma/client';

	type SearchResult = (OrderItem & { product: Product; order: Order })[];

	export let showModal: boolean;

	let searchQuery = '';
	let results: SearchResult = [];
	let isLoading = false;

	const dispatch = createEventDispatcher();

	async function searchItems() {
		if (searchQuery.trim().length < 2) return;
		isLoading = true;
		try {
			const res = await fetch(`/api/order-items/search?q=${encodeURIComponent(searchQuery)}`);
			if (res.ok) {
				results = await res.json();
			}
		} finally {
			isLoading = false;
		}
	}

	function selectBill(orderNumber: string) {
		dispatch('selectOrder', orderNumber);
	}

	function closeModal() {
		dispatch('close');
	}
</script>

{#if showModal}
	<dialog open on:close={closeModal} on:click|self={closeModal}>
		<article style="min-width: 80vw; max-width: 1200px;">
			<header>
				<button aria-label="Close" class="close" on:click={closeModal}></button>
				<h3>ค้นหาบิลอย่างละเอียดจากสินค้า</h3>
			</header>

			<form on:submit|preventDefault={searchItems}>
				<input type="search" bind:value={searchQuery} placeholder="ค้นหาจากบาร์โค้ด, ชื่อสินค้า, หรือรหัส..." />
				<button type="submit" aria-busy={isLoading}>ค้นหา</button>
			</form>

			<div style="min-height: 400px; overflow-y: auto;">
				{#if isLoading}
					<p aria-busy="true">กำลังค้นหา...</p>
				{:else if results.length === 0}
					<p>-- ไม่พบข้อมูล --</p>
				{:else}
					<table>
						<thead>
							<tr>
								<th>เลขที่บิล</th>
								<th>วันที่</th>
								<th>บาร์โค้ด</th>
								<th>ชื่อสินค้า</th>
								<th style="text-align: center;">จำนวน</th>
								<th style="text-align: center;">คืนแล้ว</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{#each results as item (item.id)}
								<tr>
									<td>{item.order.orderNumber}</td>
									<td>{new Date(item.order.createdAt).toLocaleDateString('th-TH')}</td>
									<td>{item.product.barcode}</td>
									<td>{item.product.name}</td>
									<td style="text-align: center;">{item.quantity}</td>
									<td style="text-align: center;">{item.returnedQuantity}</td>
									<td>
										<button class="outline" on:click={() => selectBill(item.order.orderNumber)}>
											เลือกบิลนี้
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>
			<footer>
				<button class="secondary" on:click={closeModal}>ปิด</button>
			</footer>
		</article>
	</dialog>
{/if}