<script lang="ts">
	import { settings } from '$lib/stores/settings';
</script>

<svelte:head>
	<title>ตั้งค่าการพิมพ์</title>
</svelte:head>

<div class="settings-container">
	<h1>ตั้งค่าการพิมพ์เริ่มต้น</h1>
	<p>เลือกขนาดกระดาษเริ่มต้นสำหรับเอกสารแต่ละประเภท</p>

	<div class="setting-item">
		<h2>ใบส่งของ (Delivery Note)</h2>
		<div class="options">
			<label>
				<input type="radio" bind:group={$settings.printDefaults.deliveryNote} value="a4" />
				A4
			</label>
			<label>
				<input type="radio" bind:group={$settings.printDefaults.deliveryNote} value="a5" />
				A5
			</label>
		</div>
	</div>

	<div class="setting-item">
		<h2>ใบเสร็จเต็มรูปแบบ (Full Receipt)</h2>
		<div class="options">
			<label>
				<input type="radio" bind:group={$settings.printDefaults.fullReceipt} value="a4" />
				A4
			</label>
			<label>
				<input type="radio" bind:group={$settings.printDefaults.fullReceipt} value="a5" />
				A5
			</label>
		</div>
	</div>

	<div class="preview">
		<h3>ค่าที่ตั้งไว้ปัจจุบัน:</h3>
		<p>
			- ใบส่งของจะพิมพ์เป็น: <strong>{ $settings.printDefaults.deliveryNote.toUpperCase() }</strong>
		</p>
		<p>
			- ใบเสร็จเต็มรูปแบบจะพิมพ์เป็น: <strong>{ $settings.printDefaults.fullReceipt.toUpperCase() }</strong>
		</p>
	</div>
</div>

<style>
	.settings-container {
		max-width: 600px;
		margin: 2rem auto;
		padding: 2rem;
		background: #fff;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}
	.setting-item {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid #eee;
	}
	.options {
		display: flex;
		gap: 1rem;
		margin-top: 0.5rem;
	}
	label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.preview {
		margin-top: 2rem;
		padding: 1rem;
		background-color: #f7f7f7;
		border-radius: 4px;
	}
</style>