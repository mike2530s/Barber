// API Admin: Actualizar estado de una reserva
// POST /api/admin/actualizar-estado

import type { APIRoute } from 'astro';
import { db } from '../../../firebase/client';
import { doc, updateDoc } from 'firebase/firestore';
import { validateSessionFromCookies } from '../../../utils/auth';

export const POST: APIRoute = async ({ request }) => {
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
        const body = await request.json();
        const { id, estado, motivoCancelacion } = body;

        // Validar datos
        if (!id || !estado) {
            return new Response(JSON.stringify({
                success: false,
                error: 'ID y estado son requeridos'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validar estado permitido
        const estadosPermitidos = ['pendiente', 'confirmada', 'completada', 'cancelada'];
        if (!estadosPermitidos.includes(estado)) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Estado no válido'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Preparar datos de actualización
        const updateData: any = {
            estado,
            updatedAt: new Date().toISOString()
        };

        // Si se está cancelando, agregar información de cancelación
        if (estado === 'cancelada') {
            updateData.canceladoPor = 'admin';
            updateData.fechaCancelacion = new Date().toISOString();

            if (motivoCancelacion) {
                updateData.motivoCancelacion = motivoCancelacion;
            }
        }

        // Actualizar en Firestore
        const reservaRef = doc(db, 'reservas', id);
        await updateDoc(reservaRef, updateData);

        return new Response(JSON.stringify({
            success: true,
            message: 'Estado actualizado correctamente'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('Error al actualizar estado:', error);

        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Error al actualizar el estado'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
