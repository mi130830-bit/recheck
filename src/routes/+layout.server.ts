// File: src/routes/+layout.server.ts

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    // ฟังก์ชัน load ได้รับ 'locals' ที่ถูกตั้งค่ามาจาก hooks

    // ✨ นี่คือการ "หยิบของออกจากกระเป๋า" แล้ว "แพ็คใส่กล่อง" เพื่อส่งต่อ ✨
    return {
        user: locals.user // <-- หยิบ 'user' จาก locals มาใส่ใน key ที่ชื่อ 'user'
    };
    // object ที่ถูก return จากตรงนี้ จะถูกส่งไปให้ +layout.svelte
};