// File: src/lib/server/auth.ts (สำหรับ Lucia v4)
import { Lucia } from 'lucia';
import { dev } from '$app/environment';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { PrismaClient } from '@prisma/client';

const client = new PrismaClient();
const adapter = new PrismaAdapter(client.session, client.user);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: !dev, // ใช้ !dev แทน process.env
        },
    },
    getUserAttributes: (attributes) => {
        return {
            username: attributes.username,
            role: attributes.role,
        };
    },
});

declare module 'lucia' {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: {
            username: string;
            role: string;
        };
    }
}