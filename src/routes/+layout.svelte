<!-- Path: src/routes/+layout.svelte (ฉบับปรับปรุงสมบูรณ์) -->

<script lang="ts">
	//import '@picocss/pico';
	// ✅ FIX: Layout ใช้ 'LayoutData' ไม่ใช่ 'PageData'
	import type { LayoutData } from './$types';

	// ✅ FIX: กำหนด Type ที่ถูกต้องให้กับ data prop
	export let data: LayoutData;
</script>

<svelte:head>
	<html lang="th" data-theme="light"></html>
</svelte:head>

<div class="app-container">
	<header class="main-header">
		<nav class="main-nav">
			<a href="/" class="brand">PjPOS</a>

			<ul class="nav-links">
				<li><a href="/">ขายสินค้า</a></li>
				<li class="dropdown">
					<a href="/products">จัดการสินค้า &#9662;</a>
					<ul class="dropdown-menu">
						<li><a href="/products">รายการสินค้าทั้งหมด</a></li>
						<li><a href="/stock-in">รับของเข้าคลัง</a></li>
						<li><a href="/returns">รับคืนสินค้า</a></li>
						<li><a href="/categories">จัดการประเภทสินค้า</a></li>
						<li><a href="/units">จัดการหน่วยสินค้า</a></li>
					</ul>
				</li>
				<li class="dropdown">
					<a href="/customers">จัดการสมาชิก &#9662;</a>
					<ul class="dropdown-menu">
						<li><a href="/customers">รายการสมาชิก</a></li>
					</ul>
				</li>
				<li class="dropdown">
					<a href="/suppliers">จัดการผู้ขาย &#9662;</a>
					<ul class="dropdown-menu">
						<li><a href="/suppliers">รายการผู้ขาย</a></li>
					</ul>
				</li>
				<li class="dropdown">
					<a href="/reports">รายงาน &#9662;</a>
					<ul class="dropdown-menu">
						<li><a href="/orders">ประวัติการขายทั้งหมด</a></li>
						<li><a href="/reports/debtors">รายงานลูกหนี้</a></li>
						<li><a href="/billing">รายการใบวางบิล</a></li>
						<li><a href="/reports">Dashboard</a></li>
						<li><a href="/reports/top-selling">รายงานสินค้าขายดี</a></li>
						<li><a href="/reports/low-stock">รายงานสต็อกใกล้หมด</a></li>
					</ul>
				</li>
			</ul>

			<div class="nav-actions">
				{#if data.user}
					<div class="dropdown">
						<!-- ✅ REFACTOR: ใช้ custom class แทน Pico class -->
						<div role="button" tabindex="0" class="user-menu">{data.user.username} &#9662;</div>
						<ul class="dropdown-menu">
							<li>
								<form method="POST" action="/logout" style="margin: 0;">
									<!-- ✅ REFACTOR: ใช้ custom class 'btn-logout' -->
									<button type="submit" class="btn-logout">ออกจากระบบ</button>
								</form>
							</li>
						</ul>
					</div>
				{:else}
					<div class="auth-buttons">
						<!-- ✅ REFACTOR: ใช้ custom class แทน Pico class -->
						<a href="/login" role="button" class="btn-login">เข้าสู่ระบบ</a>
						<a href="/signup" role="button" class="btn-signup">สมัครสมาชิก</a>
					</div>
				{/if}
			</div>
		</nav>
	</header>

	<main class="main-content">
		<slot />
	</main>
</div>

<!-- ========================= ส่วน Style ที่จัดระเบียบใหม่ ========================= -->
<style>
	:global(body) {
		margin: 0;
		background-color: #f4f6f9;
	}
	.app-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh; /* ใช้ min-height ดีกว่า height เผื่อเนื้อหายาว */
	}

	/* --- Main Layout & Header --- */
	.main-header {
		background-color: white;
		padding: 0 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		z-index: 100;
		border-bottom: 1px solid #dee2e6;
		flex-shrink: 0;
	}
	.main-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 60px;
	}
	.brand {
		font-size: 1.5em;
		font-weight: bold;
		color: #212529;
		text-decoration: none;
	}
	.main-content {
		flex-grow: 1; /* ทำให้ main content ขยายเต็มพื้นที่ที่เหลือ */
	}

	/* --- Navigation Links & Dropdown --- */
	.nav-links {
		display: flex;
		list-style: none;
		margin: 0;
		padding: 0;
		gap: 1.5rem;
		align-items: center;
		height: 100%;
	}
	.nav-links > li {
		height: 100%;
		display: flex;
		align-items: center;
	}
	.nav-links a {
		color: #495057;
		text-decoration: none;
		padding: 0.5rem 0;
		transition: color 0.3s;
	}
	.nav-links a:hover {
		color: var(--pico-primary-hover);
	}
	.dropdown {
		position: relative;
	}
	.dropdown-menu {
		display: none;
		position: absolute;
		top: calc(100% + 0.5px); /* ระยะห่างจากปุ่ม dropdown */
		background-color: white;
		list-style: none;
		padding: 0.5rem 0;
		min-width: 200px;
		border-radius: var(--pico-border-radius);
		box-shadow: var(--pico-card-box-shadow);
		border: 1px solid var(--pico-muted-border-color);
		opacity: 0;
		visibility: hidden;
		transition: opacity 0.2s, visibility 0.2s;
	}
	.nav-links .dropdown-menu {
		left: 50%;
		transform: translateX(-50%);
	}
	.nav-actions .dropdown-menu {
		left: auto;
		right: 0;
	}
	.dropdown:hover .dropdown-menu,
	.dropdown:focus-within .dropdown-menu {
		display: block;
		opacity: 1;
		visibility: visible;
	}
	.dropdown-menu li a {
		display: block;
		padding: 0.5rem 1rem;
		white-space: nowrap;
		color: #212529;
	}
	.dropdown-menu li a:hover {
		background-color: #f8f9fa;
	}

	/* --- Action & Auth Buttons (Refactored) --- */
	.nav-actions {
		display: flex;
		align-items: center;
		margin-left: 1.5rem;
	}
	.auth-buttons {
		display: flex;
		gap: 0.75rem;
	}

	/* Style กลางสำหรับปุ่ม Auth */
	.btn-login,
	.btn-signup,
	.user-menu {
		padding: 0.375rem 1rem;
		border-radius: var(--pico-border-radius);
		text-decoration: none;
		font-weight: 500;
		transition: all 0.2s ease-in-out;
		cursor: pointer;
		border: 1px solid transparent;
		font-size: 0.9rem;
		display: inline-block;
	}
	
	/* ปุ่ม Login (เหมือนปุ่ม secondary outline ของ Pico) */
	.btn-login,
	.user-menu {
		background-color: transparent;
		color: var(--pico-primary);
		border-color: var(--pico-primary);
	}
	.btn-login:hover,
	.user-menu:hover {
		background-color: var(--pico-primary);
		color: var(--pico-primary-inverse);
	}

	/* ปุ่ม Signup (เหมือนปุ่ม primary ของ Pico) */
	.btn-signup {
		background-color: var(--pico-primary);
		color: var(--pico-primary-inverse);
		border-color: var(--pico-primary);
	}
	.btn-signup:hover {
		background-color: var(--pico-primary-hover);
		border-color: var(--pico-primary-hover);
	}

/* Style ปุ่ม Logout (สถานะปกติ) */
.btn-logout {
	display: inline-block;
	width: calc(100% - 1rem); /* ปรับความกว้างให้มีช่องว่างซ้าย-ขวา */
	margin: 0.25rem 0.5rem;   /* เพิ่มระยะห่างรอบๆ ปุ่ม */
	padding: 0.5rem 1rem;
	color: #dc3545; /* สีแดง (Danger color) */
	background-color: white;
	border: 1px solid #dc3545; /* เพิ่มเส้นขอบสีแดง */
	border-radius: var(--pico-border-radius); /* ทำให้มุมโค้งมนเหมือนปุ่มอื่น */
	cursor: pointer;
	text-align: center; /* จัดข้อความกึ่งกลาง */
	font-weight: 500;
	transition: all 0.2s ease-in-out;
}

/* Style ปุ่ม Logout (เมื่อนำเมาส์ไปวาง) */
.btn-logout:hover {
	background-color: #dc3545; /* พื้นหลังเปลี่ยนเป็นสีแดง */
	color: white; /* ตัวหนังสือเปลี่ยนเป็นสีขาว */
}
</style>