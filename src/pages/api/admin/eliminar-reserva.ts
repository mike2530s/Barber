// API Admin: Eliminar una reserva
// DELETE /api/admin/eliminar-reserva

import type { APIRoute } from 'astro';
import { db } from '../../../firebase/client';
import { doc, deleteDoc } from 'firebase/firestore';
import { validateSessionFromCookies } from '../../../utils/auth';

export const DELETE: APIRoute = async ({ request }) => {
    // Verificar autenticación
    const cookieHeader = request.headers.get('cookie');
    const isAuthenticated = await validateSessionFromCookies(cookieHeader);

    if (!isAuthenticated) {
        return new Response(JSON.stringify({
            success: false,
            error: 'No autorizado'
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        // Validar ID
        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                error: 'ID es requerido'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Eliminar de Firestore
        const reservaRef = doc(db, 'reservas', id);
        await deleteDoc(reservaRef);

        return new Response(JSON.stringify({
            success: true,
            message: 'Reserva eliminada correctamente'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('Error al eliminar reserva:', error);

        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Error al eliminar la reserva'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
