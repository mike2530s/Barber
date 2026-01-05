import type { APIRoute } from 'astro';
import { createLogoutCookie } from '../../../utils/auth';

export const POST: APIRoute = async () => {
    const logoutCookie = createLogoutCookie();

    return new Response(JSON.stringify({
        success: true,
        message: 'Sesión cerrada exitosamente'
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': logoutCookie
        }
    });
};
