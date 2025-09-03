// src/lib/stores/settings.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// กำหนดโครงสร้างของการตั้งค่า
type Settings = {
	printDefaults: {
		deliveryNote: 'a4' | 'a5';
		fullReceipt: 'a4' | 'a5';
	};
};

// ค่าเริ่มต้นหากยังไม่เคยตั้งค่ามาก่อน
const defaultSettings: Settings = {
	printDefaults: {
		deliveryNote: 'a4',
		fullReceipt: 'a4'
	}
};

// ดึงข้อมูลจาก localStorage ตอนเริ่มต้น (เฉพาะฝั่ง client)
const initialValue = browser
	? JSON.parse(localStorage.getItem('app-settings')) || defaultSettings
	: defaultSettings;

// สร้าง store
export const settings = writable<Settings>(initialValue);

// เมื่อค่าใน store เปลี่ยน, ให้บันทึกลง localStorage ด้วย
if (browser) {
	settings.subscribe((value) => {
		localStorage.setItem('app-settings', JSON.stringify(value));
	});
}