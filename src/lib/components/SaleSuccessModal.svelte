<script lang="ts">
	// 1. ลบ createEventDispatcher ออก
	// import { createEventDispatcher } from 'svelte';

	// 2. เพิ่ม oncloseAndReset ใน $props
	let { showModal, newOrderId, oncloseAndReset } = $props<{
		showModal: boolean;
		newOrderId: number | null;
		oncloseAndReset: () => void;
	}>();

	// 3. ลบฟังก์ชัน handleCloseAndReset ออกไปได้เลย
</script>

{#if showModal}
	<dialog open>
		<article>
			<header>
				<a href="#close" aria-label="Close" class="close" on:click|preventDefault={oncloseAndReset}></a>
				<strong>✅ บันทึกการขายสำเร็จ!</strong>
			</header>
			<p>คุณต้องการพิมพ์ใบเสร็จหรือไม่?</p>
			<footer>
				<div class="grid">
					</div>
				<hr />
				<button on:click={oncloseAndReset}>เริ่มการขายใหม่</button>
			</footer>
		</article>
	</dialog>
{/if}

<style>
	article {
		min-width: 450px;
	}
	hr {
		margin: 1rem 0;
	}
    /* Style for the main action button */
	footer button {
		background-color: #28e132;
		border-color: #28e132;
		color: white;
	}
	footer button:hover {
		background-color: #22c52a;
		border-color: #22c52a;
	}
</style>