<script lang="ts">
  import type { PageData } from './$types';
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { applyAction } from '$app/forms';
  export let data: PageData;
  export let form;
  function confirmDelete(event: MouseEvent) {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) {
      event.preventDefault();
    }
  }
</script>

<main class="container">
  <header class="page-header">
    <h2>จัดการประเภทสินค้า ({data.categories.length} รายการ)</h2>
    <a href="/categories/new" role="button" class="primary-btn">+ เพิ่มประเภทใหม่</a>
  </header>
  {#if form?.message}
    <div class="form-error">{form.message}</div>
  {/if}
  <article class="table-card">
    {#if data.categories.length === 0}
      <p class="empty-message">ยังไม่มีข้อมูลประเภทสินค้า</p>
    {:else}
      <table>
        <thead>
          <tr>
            <th>ชื่อประเภท</th>
            <th class="actions-header">การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {#each data.categories as category (category.id)}
            <tr>
              <td class="name-cell">{category.name}</td>
              <td class="actions-cell">
                <div class="action-buttons">
                  <a href="/categories/{category.id}/edit" class="icon-btn edit-btn" title="แก้ไข">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                  </a>
                  <form method="POST" action="?/delete" use:enhance={() => {
                    return async ({ result }) => {
                      if (result.type === 'success') {
                        await invalidateAll();
                      }
                      await applyAction(result);
                    };
                  }}>
                    <input type="hidden" name="id" value={category.id} />
                    <button type="submit" class="icon-btn delete-btn" title="ลบ" on:click={confirmDelete}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </article>
</main>

<style>
  /* === Layout หลักของหน้า === */
  .container {
    max-width: 1100px;
    margin: 2rem auto;
    padding: 0 2rem;
  }
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  .page-header h2,
  .page-header a {
    margin-bottom: 0;
  }
  /* === ข้อความ Error === */
  .form-error {
    color: var(--pico-color-red-500);
    background-color: var(--pico-color-red-100);
    padding: 0.75rem;
    border-radius: var(--pico-border-radius);
    border-left: 4px solid var(--pico-invalid-border-color);
    margin-bottom: 1.5rem;
  }
  /* === สไตล์ตารางและการ์ด === */
  .table-card {
    padding: 0.5rem 0;
    border-radius: var(--pico-border-radius);
    box-shadow: var(--pico-card-box-shadow, 0 1px 2px rgba(0, 0, 0, 0.05));
    background-color: #fff;
  }
  .empty-message {
    text-align: center;
    padding: 2rem;
    color: var(--pico-muted-color);
  }
  table {
    --pico-table-border-color: transparent;
    --pico-table-row-stripped-background-color: transparent;
    margin-bottom: 0;
  }
  th {
    color: var(--pico-secondary);
    font-weight: 500;
    font-size: 0.9em;
    text-transform: uppercase;
    border-bottom: 1px solid var(--pico-muted-border-color);
  }
  tr {
    border-bottom: 1px solid var(--pico-muted-border-color);
  }
  tr:last-child {
    border-bottom: none;
  }
  .name-cell {
    padding-left: 1.5rem;
    vertical-align: middle;
  }
  .actions-header {
    text-align: right;
    width: 150px;
    padding-right: 1.5rem;
  }
  /* ไม่จำเป็นต้องใช้ .actions-cell แล้ว เพราะเราจะควบคุมด้วย .action-buttons */
  .actions-cell {
    padding-right: 1.5rem;
  }
  /* ================================================================ */
  /* === ส่วนของปุ่มทั้งหมด (นำหลักการมาจากหน้ารายการสินค้า) === */
  /* ================================================================ */
  /* 1. ปุ่มหลัก "เพิ่มประเภทใหม่" */
  .primary-btn {
    background-color: #15cb24;
    color: #fff;
    padding: 0.6rem 1.25rem;
    border-radius: var(--pico-border-radius);
    font-weight: 500;
    text-decoration: none;
    border: none;
    transition: background-color 0.2s;
  }
  .primary-btn:hover {
    background-color: #26c217;
  }
  /* 2. ตัวครอบปุ่มไอคอน (ดินสอ, ถังขยะ) */
  .action-buttons {
    display: flex;
    justify-content: flex-end; /* จัดให้ปุ่มทั้งหมดชิดขวา */
    gap: 0.5rem;
    align-items: stretch; /* จัดให้ทุกอย่างยืดความสูงเท่ากัน */
    height: 40px; /* กำหนดความสูงของแถวปุ่ม */
  }
  .action-buttons > * {
    flex: 1 1 0;
    min-width: 0; /* ป้องกันล้น */
    height: 100%; /* ยืดความสูงให้เท่ากับ .action-buttons */
    padding: 0;
    margin-bottom: 0; /* เรียก override ค่าจาก pico.css */
  }
  .action-buttons a[role='button'],
  .action-buttons button {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 0;
    padding: 0;
    box-sizing: border-box;
  }
  .action-buttons form {
    flex: 1 1 0;
    height: 100%;
    display: flex;
  }
  .action-buttons form button {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    min-width: 0;
  }
  /* 4. สีสำหรับปุ่ม "แก้ไข" (ดินสอ) */
  .edit-btn {
    border-color: #2bc414;
  }
  .edit-btn svg {
    stroke: #2bc414;
  }
  .edit-btn:hover {
    background-color: #2bc414;
  }
  .edit-btn:hover svg {
    stroke: #fff;
  }
  /* 5. สีสำหรับปุ่ม "ลบ" (ถังขยะ) */
  .delete-btn {
    border-color: #dc3545;
  }
  .delete-btn svg {
    stroke: #dc3545;
  }
  .delete-btn:hover {
    background-color: #dc3545;
  }
  .delete-btn:hover svg {
    stroke: #fff;
  }
  /* ปุ่มไอคอน reset */
  .icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    padding: 0;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
    background-color: transparent;
    border: 1px solid transparent;
  }
  .icon-btn.delete-btn {
    font-family: inherit;
    font-size: inherit;
    color: inherit;
  }
</style>
