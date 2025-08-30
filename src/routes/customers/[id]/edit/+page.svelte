<!-- Path: src/routes/customers/[id]/edit/+page.svelte (Final Updated Version) -->
<script lang="ts">
  import { enhance } from '$app/forms';
  export let data;
  export let form;
</script>

<main class="container" style="max-width: 700px;">
  <h1>แก้ไขข้อมูลสมาชิก: {data.customer.firstName}</h1>
  {#if form?.error}<p class="error">{form.error}</p>{/if}

  <form method="POST" use:enhance>
    <div class="grid">
      <label>รหัสสมาชิก *<input name="memberCode" value={data.customer.memberCode} required /></label>
      <label>คำนำหน้า<input name="title" value={data.customer.title || ''} /></label>
    </div>
    <div class="grid">
      <label>ชื่อ *<input name="firstName" value={data.customer.firstName} required /></label>
      <label>นามสกุล<input name="lastName" value={data.customer.lastName || ''} /></label>
    </div>
    <div class="grid">
      <label>โทรศัพท์<input name="phone" value={data.customer.phone || ''} /></label>
      <label>อีเมล<input name="email" value={data.customer.email || ''} /></label>
    </div>
    <label>ที่อยู่<textarea name="address" rows="3">{data.customer.address || ''}</textarea></label>
    <!-- [เพิ่ม] ช่องแก้ไขที่อยู่สำหรับจัดส่ง -->
    <label>ที่อยู่สำหรับจัดส่ง
      <textarea name="shippingAddress" rows="3">{data.customer.shippingAddress || ''}</textarea>
    </label>

    <button type="submit">บันทึกการเปลี่ยนแปลง</button>
  </form>
</main>
<style>.error {color: red;}</style>