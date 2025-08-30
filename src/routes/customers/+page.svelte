<!-- Path: src/routes/customers/+page.svelte (Final Version with Search & Pagination) -->

<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { PageData } from './$types';
  
  export let data: PageData;
  $: ({ customers, totalItems, currentPage, totalPages, query, form } = data);

  let searchQuery = data.query ?? '';
  let debounceTimer: NodeJS.Timeout;

  function handleSearchInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const params = new URLSearchParams($page.url.searchParams.toString());
      params.set('query', searchQuery);
      params.set('page', '1');
      goto(`?${params.toString()}`, { 
        keepFocus: true, noScroll: true, replaceState: true
      });
    }, 300);
  }
</script>

<main class="container">
  <header class="header-container">
    <h1>จัดการข้อมูลสมาชิก ({totalItems} รายการ)</h1>
    <div class="button-group">
      <a href="/customers/import" role="button" class="secondary outline">นำเข้าจาก Excel</a>
      <a href="/customers/new" role="button">+ เพิ่มสมาชิกใหม่</a>
    </div>
  </header>
  
  <div class="search-form">
    <input 
      type="search" 
      name="query" 
      placeholder="พิมพ์เพื่อค้นหาจากรหัส, ชื่อ, หรือเบอร์โทร..." 
      bind:value={searchQuery}
      on:input={handleSearchInput}
    />
  </div>

  {#if form?.message}
    <aside class="error-message"><p>{form.message}</p></aside>
  {/if}

  {#if customers.length === 0}
    <article><p>ไม่พบข้อมูลสมาชิกที่ตรงกับเงื่อนไข</p></article>
  {:else}
    <div style="overflow-x: auto;">
      <table>
        <thead>
          <tr>
            <th>รหัสสมาชิก</th>
            <th>ชื่อ - นามสกุล</th>
            <th>โทรศัพท์</th>
            <th>อีเมล</th>
            <th style="width: 200px;">การกระทำ</th>
          </tr>
        </thead>
        <tbody>
          {#each customers as customer (customer.id)}
            <tr>
              <td><strong>{customer.memberCode}</strong></td>
              <td>{customer.firstName} {customer.lastName || ''}</td>
              <td>{customer.phone || '-'}</td>
              <td>{customer.email || '-'}</td>
              <td>
                <div class="action-buttons">
                  <a href="/customers/{customer.id}/edit" role="button" class="outline">แก้ไข</a>
                  <form method="POST" action="?/delete" use:enhance>
                    <input type="hidden" name="id" value={customer.id} />
                    <button type="submit" class="contrast outline" on:click={(event) => {
                      if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${customer.firstName}"?`)) {
                        event.preventDefault();
                      }
                    }}>ลบ</button>
                  </form>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if totalPages > 1}
      <nav class="pagination">
        <ul>
          <li>
            <a href="?query={searchQuery}&page={currentPage - 1}" aria-label="Previous" class:disabled={currentPage <= 1}>&laquo; ก่อนหน้า</a>
          </li>
          <li><span>หน้า {currentPage} / {totalPages}</span></li>
          <li>
            <a href="?query={searchQuery}&page={currentPage + 1}" aria-label="Next" class:disabled={currentPage >= totalPages}>ถัดไป &raquo;</a>
          </li>
        </ul>
      </nav>
    {/if}
  {/if}
</main>

<style>
  .container { max-width: 1024px; margin: 2rem auto; }
  .header-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
  .button-group { display: flex; gap: 0.5rem; }
  .search-form { margin-bottom: 2rem; }
  .action-buttons { display: flex; gap: 0.5rem; }
  .action-buttons form { margin: 0; }
  .error-message { background-color: var(--pico-form-element-invalid-background-color); color: var(--pico-form-element-invalid-color); border-color: var(--pico-form-element-invalid-border-color); padding: 0.5rem 1rem; margin-bottom: 1rem; border-radius: var(--pico-border-radius); }
  .pagination { margin-top: 2rem; display: flex; justify-content: center; }
  .pagination ul { display: flex; list-style: none; padding: 0; margin: 0; align-items: center; gap: 1rem; }
  .pagination a { display: block; padding: 0.5rem 1rem; text-decoration: none; border: 1px solid var(--pico-muted-border-color); border-radius: var(--pico-border-radius); }
  .pagination a.disabled { pointer-events: none; opacity: 0.5; color: var(--pico-muted-color); }
  .pagination a:not(.disabled):hover { background-color: var(--pico-muted-background-color); }
</style>