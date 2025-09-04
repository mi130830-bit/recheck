<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let showModal: boolean;
	export let newOrderId: number | null;

	const dispatch = createEventDispatcher();

	function handleCloseAndReset() {
		// ส่ง event แจ้งให้ Page หลักทำงานปิด Modal และ Reset ค่าต่างๆ
		dispatch('closeAndReset');
	}
</script>

{#if showModal}
	<dialog open>
		<article>
			<header>
				<a href="#close" aria-label="Close" class="close" on:click|preventDefault={handleCloseAndReset}></a>
				<strong>✅ บันทึกการขายสำเร็จ!</strong>
			</header>
			<p>คุณต้องการพิมพ์ใบเสร็จหรือไม่?</p>
			<footer>
				<div class="grid">
					<a href="/receipts/{newOrderId}?size=a4" target="_blank" role="button" class="secondary">พิมพ์ (A4)</a>
					<a href="/receipts/{newOrderId}?size=a5" target="_blank" role="button" class="secondary">พิมพ์ (A5)</a>
					<a href="/receipts/{newOrderId}?size=slip" target="_blank" role="button" class="secondary outline">พิมพ์ (สลิป)</a>
				</div>
				<hr />
				<button on:click={handleCloseAndReset}>เริ่มการขายใหม่</button>
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