<script lang="ts">
	// import { createEventDispatcher } from 'svelte'; // 1. ลบออก
	import type { Order, Customer, OrderItem, Product } from '@prisma/client';

	type FullOrder = Order & { customer: Customer | null; items: (OrderItem & { product: Product })[] };

	// 2. เพิ่ม onselect และ onclose ใน $props
	let { showModal, onselect, onclose } = $props<{
		showModal: boolean;
		onselect: (order: FullOrder) => void;
		onclose: () => void;
	}>();

	let heldOrders = $state<FullOrder[]>([]);
	let isLoading = $state(true);
	let errorMessage = $state('');

	$effect(() => {
		// ... logic การ fetch ข้อมูลเหมือนเดิม ...
	});

	function selectBill(order: FullOrder) {
		onselect(order); // 3. เรียก onselect(order) แทน dispatch
	}

	// 4. ลบฟังก์ชัน closeModal() เดิมทิ้ง

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onclose(); // 5. เรียก onclose() แทน closeModal()
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if showModal}
	<dialog open on:close={onclose} on:click|self={onclose}>
		<article>
			<header>
				<button aria-label="Close" class="close" on:click={onclose}></button>
				<h3>รายการบิลที่พักไว้</h3>
			</header>
			<div class="modal-body">
				{#if !isLoading && !errorMessage && heldOrders.length > 0}
					<table>
						<tbody>
							{#each heldOrders as order (order.id)}
								<tr>
									<td><button on:click={() => selectBill(order)} class="outline">เลือก</button></td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>
			<footer>
				<button class="secondary" on:click={onclose}>ปิดหน้าต่าง</button>
			</footer>
		</article>
	</dialog>
{/if}


<style>
	dialog {
		max-width: 600px;
	}
	.modal-body {
		min-height: 200px;
	}
</style>