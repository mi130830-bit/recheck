<!-- File: src/routes/suppliers/[id]/edit/+page.svelte -->

<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  export let data; // รับข้อมูล supplier จาก load
</script>

<main class="container">
  <article>
    <header>
      <h2>แก้ไขข้อมูลผู้ขาย: {data.supplier.name}</h2>
    </header>

    <form method="POST" action="?/update" use:enhance>
      {#if $page.form?.message}
        <p class="error">{$page.form.message}</p>
      {/if}

      <div class="grid">
        <label for="code">
          * รหัสผู้ขาย
          <input type="text" id="code" name="code" required value={data.supplier.code} />
        </label>
        <label for="name">
          * ชื่อผู้ขาย
          <input type="text" id="name" name="name" required value={data.supplier.name} />
        </label>
      </div>

      <label for="taxId">
        Tax ID
        <input type="text" id="taxId" name="taxId" value={data.supplier.taxId || ''} />
      </label>

      <div class="grid">
        <label for="phone">
          โทรศัพท์
          <input type="tel" id="phone" name="phone" value={data.supplier.phone || ''} />
        </label>
        <label for="email">
          E-mail
          <input type="email" id="email" name="email" value={data.supplier.email || ''} />
        </label>
      </div>

      <label for="address">ที่อยู่</label>
      <textarea id="address" name="address">{data.supplier.address || ''}</textarea>

      <footer>
        <button type="submit">บันทึกการเปลี่ยนแปลง</button>
        <a href="/suppliers" role="button" class="secondary">ยกเลิก</a>
      </footer>
    </form>
  </article>
</main>

<style>
  .container { max-width: 720px; margin: 0 auto; }
  .error { color: var(--pico-form-element-invalid-color); }
</style>