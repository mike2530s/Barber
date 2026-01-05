import type { APIRoute } from 'astro';
import { validateSessionFromCookies } from '../../../utils/auth';

export const GET: APIRoute = async ({ request }) => {
    const cookieHeader = request.headers.get('cookie');
    const isValid = await validateSessionFromCookies(cookieHeader);

    return new Response(JSON.stringify({
        authenticated: isValid
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};
