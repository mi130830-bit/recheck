<!-- File: src/routes/login/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
</script>
<main>
  <article>
    <h1>เข้าสู่ระบบ</h1>
    <form method="POST" use:enhance>
      {#if $page.form?.message}
        <p role="alert">{$page.form.message}</p>
      {/if}
      <label for="username">Username</label>
      <input type="text" name="username" id="username" required />
      <label for="password">Password</label>
      <input type="password" name="password" id="password" required />
      <button type="submit">เข้าสู่ระบบ</button>
    </form>
    <p>ยังไม่มีบัญชี? <a href="/signup">สมัครสมาชิก</a></p>
  </article>
</main>
<style>
  main { display: flex; justify-content: center; align-items: center; min-height: 80vh; }
  article { max-width: 400px; width: 100%; }
</style>