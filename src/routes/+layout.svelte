<!-- src/routes/+layout.svelte -->

<script lang="ts">
	import '@picocss/pico';
	
	export let data; // รับข้อมูล user ที่ส่งมาจาก +layout.server.ts
</script>

<svelte:head>
	<html lang="th" data-theme="light"></html>
</svelte:head>

<div class="app-container">
	<header class="main-header">
		<nav class="main-nav">
			<a href="/" class="brand">PjPOS</a>

			<!-- เมนูหลัก -->
			<ul class="nav-links">
				<!-- ... (ส่วนเมนูอื่นๆ ของคุณเหมือนเดิม) ... -->
				<li><a href="/">ขายสินค้า</a></li>
				<li class="dropdown">
					<a href="/products">จัดการสินค้า &#9662;</a>
					<ul class="dropdown-menu">
						<li><a href="/products">รายการสินค้าทั้งหมด</a></li>
						<li><a href="/stock-in">รับของเข้าคลัง</a></li>
					</ul>
				</li>
				<li class="dropdown">
					<a href="/customers">จัดการสมาชิก &#9662;</a>
					<ul class="dropdown-menu">
						<li><a href="/customers">รายการสมาชิก</a></li>
						<li><a href="/customers/new">เพิ่มสมาชิกใหม่</a></li>
					</ul>
				</li>
				<li class="dropdown">
					<a href="/suppliers">จัดการผู้ขาย &#9662;</a>
					<ul class="dropdown-menu">
						<li><a href="/suppliers">รายการผู้ขาย</a></li>
						<li><a href="/suppliers/new">เพิ่มผู้ขายใหม่</a></li>
					</ul>
				</li>
				<li class="dropdown">
					<a href="/reports">รายงาน &#9662;</a>
					<ul class="dropdown-menu">
						<li><a href="/orders">ประวัติการขายทั้งหมด</a></li>
						<li><a href="/reports/debtors">รายงานลูกหนี้</a></li>
						<li><a href="/reports">Dashboard</a></li>
						<li><a href="/reports/top-selling">รายงานสินค้าขายดี</a></li>
						<li><a href="/reports/low-stock">รายงานสต็อกใกล้หมด</a></li>
					</ul>
				</li>
			</ul>

			<!-- ส่วนจัดการ User และ Logout -->
			<div class="nav-actions">
				{#if data.user}
					<div class="dropdown">
						<a href="#" role="button" class="secondary outline user-menu">{data.user.username} &#9662;</a>
						<ul class="dropdown-menu">
							<li>
								<form method="POST" action="/logout" style="margin: 0;">
									<button type="submit" class="contrast" style="width: 100%; text-align: left; margin: 0;">ออกจากระบบ</button>
								</form>
							</li>
						</ul>
					</div>
				{:else}
					<div class="auth-buttons">
						<a href="/login" role="button" class="secondary outline">เข้าสู่ระบบ</a>
						<a href="/signup" role="button">สมัครสมาชิก</a>
					</div>
				{/if}
			</div>

		</nav>
	</header>

	<main class="main-content">
		<slot />
	</main>
</div>

<!-- ... (ส่วน style ของคุณเหมือนเดิม) ... -->
<style>
	:global(body) {
		margin: 0;
		background-color: #f4f6f9;
	}
	.app-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}
	.main-header {
		background-color: white;
		color: #425466;
		padding: 0 1.5rem;
		flex-shrink: 0;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		z-index: 100;
		border-bottom: 1px solid #dee2e6;
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
		position: relative;
		transition: color 0.3s;
	}
	.nav-links a:hover {
		color: #007bff;
	}

	/* --- Dropdown CSS --- */
	.dropdown {
		position: relative;
	}
	.dropdown-menu {
		display: none;
		position: absolute;
		top: 100%;
		/* ปรับตำแหน่ง dropdown ของ user menu ให้ชิดขวา */
		left: auto;
		right: 0;
		transform: none; /* เอา translateX ออก */
		background-color: white;
		list-style: none;
		padding: 0.5rem 0;
		min-width: 160px; /* ปรับขนาดให้พอดี */
		border-radius: var(--pico-border-radius);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		border: 1px solid #dee2e6;
		opacity: 0;
		visibility: hidden;
		transition: opacity 0.2s, visibility 0.2s;
		margin-top: 0; /* เพิ่มระยะห่างเล็กน้อย */
	}
    /* ปรับปรุง CSS ของ dropdown ที่อยู่ใน nav-links ให้เหมือนเดิม */
    .nav-links .dropdown-menu {
        left: 50%;
        right: auto;
        transform: translateX(-50%);
    }

	.dropdown:hover .dropdown-menu {
		display: block;
		opacity: 1;
		visibility: visible;
	}
	.dropdown-menu li a,
    .dropdown-menu li button { /* เพิ่ม button เข้ามาใน selector */
		display: block;
		padding: 0.5rem 1rem;
		white-space: nowrap;
		color: #212529;
        background: none;
        border: none;
        cursor: pointer;
	}
	.dropdown-menu li a:hover,
    .dropdown-menu li button:hover {
		background-color: #f8f9fa;
	}

    .nav-actions {
        margin-left: 1.5rem;
    }

    .auth-buttons {
        display: flex;
        gap: 0.75rem;
    }

	.main-content {
		flex-grow: 1;
		overflow-y: auto;
		padding: 1.5rem;
	}
</style>