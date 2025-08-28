// Path: src/routes/env-test/+page.server.ts

import { TELEGRAM_BOT_TOKEN, TELEGRAM_SHIPPING_CHAT_ID } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    // พิมพ์ค่าที่อ่านได้ออกมาใน Terminal
    console.log('--- ENV TEST ---');
    console.log('BOT TOKEN:', TELEGRAM_BOT_TOKEN ? 'Loaded' : 'NOT FOUND');
    console.log('SHIPPING CHAT ID:', TELEGRAM_SHIPPING_CHAT_ID ? 'Loaded' : 'NOT FOUND');
    console.log('----------------');

    // ส่งค่าไปแสดงผลบนหน้าเว็บ
    return {
        botTokenLoaded: !!TELEGRAM_BOT_TOKEN,
        shippingChatIdLoaded: !!TELEGRAM_SHIPPING_CHAT_ID
    };
};