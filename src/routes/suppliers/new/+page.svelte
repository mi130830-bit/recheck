<!-- File: src/routes/suppliers/new/+page.svelte -->

<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
</script>

<main class="container">
  <article>
    <header>
      <h2>เพิ่มรายการผู้ขายใหม่</h2>
    </header>

    <!-- 
      - method="POST": บอกให้ฟอร์มส่งข้อมูลไปที่ Server
      - use:enhance: นี่คือเวทมนตร์ของ SvelteKit! มันจะทำให้ฟอร์มส่งข้อมูลโดยที่หน้าเว็บไม่ต้องโหลดใหม่ทั้งหมด ทำให้ประสบการณ์ใช้งานลื่นไหล
    -->
    <form method="POST" use:enhance>
      <!-- แสดงข้อความ Error ถ้าการบันทึกข้อมูลล้มเหลว -->
      {#if $page.form?.message}
        <p class="error">{$page.form.message}</p>
      {/if}

      <div class="grid">
        <label for="code">
          * รหัสผู้ขาย
          <input type="text" id="code" name="code" required placeholder="เช่น SUP001" />
        </label>
        <label for="name">
          * ชื่อผู้ขาย
          <input type="text" id="name" name="name" required placeholder="เช่น บริษัท พัฒนา จำกัด" />
        </label>
      </div>

      <label for="taxId">
        Tax ID
        <input type="text" id="taxId" name="taxId" />
      </label>

      <div class="grid">
        <label for="phone">
          โทรศัพท์
          <input type="tel" id="phone" name="phone" />
        </label>
        <label for="email">
          E-mail
          <input type="email" id="email" name="email" />
        </label>
      </div>

      <label for="address">ที่อยู่</label>
      <textarea id="address" name="address"></textarea>

      <footer>
        <button type="submit">บันทึกข้อมูล</button>
        <a href="/suppliers" role="button" class="secondary">ยกเลิก</a>
      </footer>
    </form>
  </article>
</main>

<style>
  .container {
    max-width: 720px;
    margin: 2rem auto;
  }
  .error {
    color: var(--pico-color-red-500);
    background-color: var(--pico-color-red-100);
    padding: 0.75rem;
    border-radius: var(--pico-border-radius);
    margin-bottom: 1rem;
  }
</style>