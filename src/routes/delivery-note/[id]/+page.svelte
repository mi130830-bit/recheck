<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { settings } from '$lib/stores/settings'; // <-- 1. Import store

	// ... (ส่วนข้อมูลตัวอย่างเหมือนเดิม) ...
	const shopInfo = { name: 'ร้าน PJ POS', /*...*/ };
	const order = { orderNumber: 'DN-2025-0001', /*...*/ };

	// ▼▼▼ 2. แก้ไขตรรกะการเลือกขนาดกระดาษ ▼▼▼
	// ตรวจสอบว่ามี ?size=... ใน URL หรือไม่
	const urlSize = $page.url.searchParams.get('size');
	
	// ถ้ามี size ใน URL ให้ใช้ค่านั้น
	// ถ้าไม่มี ให้ดึงค่าจาก settings store
	// ถ้าไม่มีใน store อีก ให้ใช้ 'a4' เป็นค่าสุดท้าย
	$: paperSize = urlSize || $settings.printDefaults.deliveryNote || 'a4';
	// ▲▲▲ สิ้นสุดส่วนที่แก้ไข ▲▲▲

	onMount(() => {
		setTimeout(() => {
			window.print();
		}, 300);
	});
</script>

<svelte:head>
	<title>ใบส่งของ #{order.orderNumber}</title>
</svelte:head>
<div class="delivery-note-container" class:a4={paperSize === 'a4'} class:a5={paperSize === 'a5'}>
	</div>
<style>
	/* ... */
</style>