import type { APIRoute } from 'astro';
import { verifyAdminPassword, createSessionCookie } from '../../../utils/auth';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { password } = body;

        if (!password) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Contraseña requerida'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Verificar la contraseña
        const isValid = await verifyAdminPassword(password);

        if (!isValid) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Contraseña incorrecta'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Crear cookie de sesión
        const sessionCookie = await createSessionCookie();

        return new Response(JSON.stringify({
            success: true,
            message: 'Login exitoso'
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': sessionCookie
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Error en el servidor'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
