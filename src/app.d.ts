// src/app.d.ts

// เพิ่มการ import Type ของ User และ Session จาก Lucia
import type { User, Session } from 'lucia';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}

		// 👇 เพิ่ม Type ของเราเข้าไปใน interface Locals ตรงนี้
		interface Locals {
			user: User | null;
			session: Session | null;
		}

		// interface PageData {}
		// interface Platform {}
	}
}

export {};