<!-- File: src/routes/suppliers/+page.svelte (Final Corrected Version) -->

<script lang="ts">
  import { enhance } from '$app/forms';
  export let data;
</script>

<main class="container">
  <!-- [แก้ไข] เพิ่ม div.button-group เพื่อจัดกลุ่มปุ่ม -->
  <header class="header-container">
    <h1>จัดการข้อมูลผู้ขาย</h1>
    <div class="button-group">
      <!-- [เพิ่ม] ปุ่มสำหรับไปหน้า Import -->
      <a href="/suppliers/import" role="button" class="secondary outline">นำเข้าจาก Excel</a>
      <a href="/suppliers/new" role="button">+ เพิ่มผู้ขายใหม่</a>
    </div>
  </header>

  {#if data.form?.message}
    <aside class="error-message">
        <p>{data.form.message}</p>
    </aside>
  {/if}

  {#if data.suppliers.length === 0}
    <article><p>ยังไม่มีข้อมูลผู้ขายในระบบ</p></article>
  {:else}
    <table>
      <thead>
        <tr>
          <th>รหัส</th>
          <th>ชื่อผู้ขาย</th>
          <th>เบอร์โทรศัพท์</th>
          <th>Tax ID</th>
          <th style="width: 200px;">การกระทำ</th>
        </tr>
      </thead>
      <tbody>
        {#each data.suppliers as supplier (supplier.id)}
          <tr>
            <td><strong>{supplier.code}</strong></td>
            <td>{supplier.name}</td>
            <td>{supplier.phone || '-'}</td>
            <td>{supplier.taxId || '-'}</td>
            <td>
              <div class="action-buttons">
                <a href="/suppliers/{supplier.id}/edit" role="button" class="outline">แก้ไข</a>
                <form 
                  method="POST" 
                  action="?/delete" 
                  use:enhance
                  on:submit|preventDefault={async (event) => {
                    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${supplier.name}"?`)) {
                      await event.currentTarget.submit();
                    }
                  }}
                >
                  <input type="hidden" name="id" value={supplier.id} />
                  <button type="submit" class="contrast outline">ลบ</button>
                </form>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</main>

<style>
  .container { max-width: 960px; margin: 2rem auto; }
  .header-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
  
  /* [เพิ่ม] CSS สำหรับจัดกลุ่มปุ่ม */
  .button-group {
    display: flex;
    gap: 0.5rem; /* เพิ่มช่องว่างระหว่างปุ่ม */
  }
  
  .action-buttons { display: flex; gap: 0.5rem; }
  .action-buttons form { margin: 0; }
  .error-message {
    background-color: var(--pico-form-element-invalid-background-color);
    color: var(--pico-form-element-invalid-color);
    border-color: var(--pico-form-element-invalid-border-color);
    padding: 0.5rem 1rem;
    margin-bottom: 1rem;
    border-radius: var(--pico-border-radius);
  }
</style>