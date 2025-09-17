<script lang="ts">
	import { enhance } from '$app/forms';

	// 1. รับ props และ callbacks ด้วย $props()
	const { showModal, itemType, title, onadded, onclose } = $props<{
		showModal: boolean;
		itemType: 'Category' | 'Unit';
		title: string;
		onadded: (newItem: any) => void;
		onclose: () => void;
	}>();

	// 2. ใช้ $state() สำหรับ state ที่ต้อง reactive
	let name = $state('');
	let error = $state<string | null>(null);
	let isLoading = $state(false);

	// 3. ใช้ $effect() เพื่อ reset ค่าเมื่อ modal เปิด
	$effect(() => {
		if (showModal) {
			name = '';
			error = null;
			// isLoading ไม่ต้อง reset ที่นี่ เพราะ form enhance จัดการอยู่แล้ว
		}
	});

	function handleSuccess(newItem: any) {
		onadded(newItem); // 4. เรียกใช้ callback onadded() แทน dispatch
		onclose();      // เรียก onclose() เพื่อปิด
	}
</script>

{#if showModal}
	<dialog open on:close={onclose}>
		<article>
			<header>
				<button aria-label="Close" class="close" on:click|preventDefault={onclose}></button>
				<strong>{title}</strong>
			</header>

			<form
				method="POST"
				action="?/{itemType === 'Category' ? 'addCategory' : 'addUnit'}"
				use:enhance={() => {
					isLoading = true;
					return async ({ result }) => {
						isLoading = false;
						if (result.type === 'success' && result.data?.newItem) {
							handleSuccess(result.data.newItem);
						}
						if (result.type === 'failure') {
							error = result.data?.addError || 'เกิดข้อผิดพลาด';
						}
					};
				}}
			>
				<label for="new-item-name">ชื่อ</label>
				<input type="text" id="new-item-name" name="name" bind:value={name} required />

				{#if error}
					<small class="error-text">{error}</small>
				{if}

				<footer class="modal-actions">
					<button type="button" on:click={onclose} disabled={isLoading}>ยกเลิก</button>
					<button type="submit" disabled={isLoading}>{isLoading ? 'กำลังบันทึก...' : 'บันทึก'}</button>
				</footer>
			</form>
		</article>
	</dialog>
{/if}

<style>
	/* ================================================================ */
	/* === Modal Actions (Footer & Buttons) === */
	/* ================================================================ */
	.modal-actions {
		display: grid; /* [ปรับแก้] ใช้ Grid เพื่อให้ปุ่มขยายเต็มและแบ่งครึ่ง */
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	/* 
    1. สไตล์ร่วมสำหรับ "ปุ่มทุกอัน"
       *** นี่คือจุดหลักที่คุณต้องปรับขนาดและความสูง ***
  */
	.modal-actions button {
		/* --- ปรับขนาดตรงนี้ --- */
		padding: 0.6rem 1rem; /* ควบคุมขนาด (สูง x กว้าง) */
		min-height: 44px;
		/* ---------------------- */

		margin: 0;
		font-weight: var(--pico-font-weight-bold, bold);
		transition: all 0.2s ease-in-out;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	/* 2. สไตล์สำหรับปุ่ม "ยกเลิก" (ปุ่มตัวแรก) */
	.modal-actions button:first-child {
		/* ใช้คลาส .secondary ของ Pico เพื่อสไตล์พื้นฐาน */
		--pico-background-color: var(--pico-secondary-background);
		--pico-border-color: var(--pico-secondary-border);
		--pico-color: var(--pico-secondary);
	}
	.modal-actions button:first-child:hover {
		--pico-background-color: var(--pico-secondary-hover-background);
	}

	/* 3. สไตล์สำหรับปุ่ม "บันทึก" (ปุ่มตัวสุดท้าย) */
	.modal-actions button:last-child {
		/* ใช้คลาส .primary (สีน้ำเงิน) ของ Pico เป็นค่าเริ่มต้น */
		--pico-background-color: var(--pico-primary-background);
		--pico-border-color: var(--pico-primary-border);
		--pico-color: var(--pico-primary-inverse);
	}
	.modal-actions button:last-child:hover {
		--pico-background-color: var(--pico-primary-hover-background);
	}

	.error-text {
		color: var(--pico-color-red-500);
	}
</style>