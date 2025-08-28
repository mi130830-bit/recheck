// File: src/lib/server/telegram.ts

import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_SHIPPING_CHAT_ID } from '$env/static/private';

// สร้าง Object เพื่อให้เรียกใช้ Chat ID ได้ง่ายๆ
export const ChatId = {
  SALES: TELEGRAM_CHAT_ID,
  SHIPPING: TELEGRAM_SHIPPING_CHAT_ID,
};

/**
 * ฟังก์ชันสำหรับส่งข้อความไปยังกลุ่ม Telegram ที่ระบุ
 * @param message ข้อความที่ต้องการส่ง
 * @param targetChatId ID ของห้องแชทเป้าหมาย (ใช้ค่าจาก ChatId object)
 */
export async function sendTelegramMessage(message: string, targetChatId: string) {
  if (!TELEGRAM_BOT_TOKEN || !targetChatId) {
    console.error('Telegram Bot Token or Target Chat ID is not set.');
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  const payload = {
    chat_id: targetChatId,
    text: message,
    parse_mode: 'Markdown',
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
        console.error('Telegram API error:', await response.json());
    }
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
  }
}