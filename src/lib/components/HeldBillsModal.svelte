<!-- Path: src/lib/components/HeldBillsModal.svelte (ฉบับเต็มสมบูรณ์) -->

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Order, Customer, OrderItem, Product } from '@prisma/client';

	type FullOrder = Order & { customer: Customer | null; items: (OrderItem & { product: Product })[] };

	export let showModal: boolean;

	let heldOrders: FullOrder[] = [];
	let isLoading = true;

	const dispatch = createEventDispatcher();

	async function fetchHeldOrders() {
		if (!showModal) return;
		isLoading = true;
		try {
			// ยิง fetch ไปที่ Path ที่ถูกต้อง
			const response = await fetch('/api/orders/hold'); 
			if (response.ok) {
				heldOrders = await response.json();
			} else {
				console.error('Failed to fetch held orders');
				heldOrders = [];
			}
		} catch (error) {
			console.error('Error fetching held orders:', error);
			heldOrders = [];
		} finally {
			isLoading = false;
		}
	}

	function selectBill(order: FullOrder) {
		dispatch('select', order);
	}

	function closeModal() {
		dispatch('close');
	}

	// เมื่อ showModal เปลี่ยนเป็น true ให้ fetch ข้อมูล
	$: if (showModal) {
		fetchHeldOrders();
	}
	
	function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
          closeModal();
      }
  }
</script>

<svelte:window on:keydown={handleKeydown}/>

{#if showModal}
	<dialog open on:close={closeModal} on:click|self={closeModal}>
		<article>
			<header>
				<button aria-label="Close" class="close" on:click={closeModal}></button>
				<h3>รายการบิลที่พักไว้</h3>
			</header>

			<div class="modal-body">
				{#if isLoading}
					<p aria-busy="true">กำลังโหลดข้อมูล...</p>
				{:else if heldOrders.length === 0}
					<p>ไม่มีบิลที่พักไว้ในขณะนี้</p>
				{:else}
					<table>
						<thead>
							<tr>
								<th>เลขที่บิล</th>
								<th>ลูกค้า</th>
								<th style="text-align: right;">ยอดรวม</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{#each heldOrders as order (order.id)}
								<tr>
									<td>
										{order.orderNumber}<br />
										<small>{new Date(order.createdAt).toLocaleTimeString('th-TH')}</small>
									</td>
									<td>{order.customer?.firstName || 'ลูกค้าทั่วไป'}</td>
									<td style="text-align: right;">{order.total.toFixed(2)}</td>
									<td><button on:click={() => selectBill(order)} class="outline">เลือก</button></td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>

			<footer>
				<button class="secondary" on:click={closeModal}>ปิดหน้าต่าง</button>
			</footer>
		</article>
	</dialog>
{/if}

<style>
	dialog { max-width: 600px; }
	.modal-body { min-height: 200px; }
</style>