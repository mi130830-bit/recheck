<!-- File: src/routes/customers/+page.svelte -->

<script lang="ts">
  import { enhance } from '$app/forms';
  export let data;
</script>

<main class="container">
  <header class="header-container">
    <h1>จัดการข้อมูลสมาชิก</h1>
    <a href="/customers/new" role="button">+ เพิ่มสมาชิกใหม่</a>
  </header>

  {#if data.form?.message}
    <aside class="error-message">
        <p>{data.form.message}</p>
    </aside>
  {/if}

  {#if data.customers.length === 0}
    <article><p>ยังไม่มีข้อมูลลูกค้าในระบบ</p></article>
  {:else}
    <table>
      <thead>
        <tr>
          <th>รหัสสมาชิก</th>
          <th>ชื่อ - นามสกุล</th>
          <th>เบอร์โทรศัพท์</th>
          <th>อีเมล</th>
          <th style="width: 200px;">การกระทำ</th>
        </tr>
      </thead>
      <tbody>
        {#each data.customers as customer (customer.id)}
          <tr>
            <td><strong>{customer.memberCode}</strong></td>
            <td>{customer.firstName} {customer.lastName || ''}</td>
            <td>{customer.phone || '-'}</td>
            <td>{customer.email || '-'}</td>
            <td>
              <div class="action-buttons">
                <a href="/customers/{customer.id}/edit" role="button" class="outline">แก้ไข</a>
                <form 
                  method="POST" 
                  action="?/delete" 
                  use:enhance
                  on:submit|preventDefault={async (event) => {
                    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${customer.firstName}"?`)) {
                      await event.currentTarget.submit();
                    }
                  }}
                >
                  <input type="hidden" name="id" value={customer.id} />
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
  .container { max-width: 960px; margin: 0 auto; }
  .header-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
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