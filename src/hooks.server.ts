// File: src/hooks.server.ts
import { lucia } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const handle = async ({ event, resolve }) => {
    const sessionId = event.cookies.get(lucia.sessionCookieName);

    if (!sessionId) {
        event.locals.user = null;
        event.locals.session = null;
    } else {
        const { session, user } = await lucia.validateSession(sessionId);
        if (session && session.fresh) {
            const sessionCookie = lucia.createSessionCookie(session.id);
            event.cookies.set(sessionCookie.name, sessionCookie.value, {
                path: '.',
                ...sessionCookie.attributes,
            });
        }
        if (!session) {
            const sessionCookie = lucia.createBlankSessionCookie();
            event.cookies.set(sessionCookie.name, sessionCookie.value, {
                path: '.',
                ...sessionCookie.attributes,
            });
        }
        event.locals.user = user;
        event.locals.session = session;
    }

    // --- ป้องกัน Route ---
    if (event.route.id && event.route.id !== "/login" && event.route.id !== "/signup") {
        if (!event.locals.user) {
            throw redirect(303, "/login");
        }
    }
    
    return resolve(event);
};