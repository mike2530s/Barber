// API Admin: Actualizar estado de una reserva
// POST /api/admin/actualizar-estado

import type { APIRoute } from 'astro';
import { db } from '../../../firebase/client';
import { doc, updateDoc } from 'firebase/firestore';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { id, estado } = body;

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

        // Actualizar en Firestore
        const reservaRef = doc(db, 'reservas', id);
        await updateDoc(reservaRef, {
            estado,
            updatedAt: new Date().toISOString()
        });

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
