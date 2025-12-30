// API: Verificar token de cancelación
// GET /api/cancelar/verificar?token=xxx

import type { APIRoute } from 'astro';
import { db } from '../../../firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const GET: APIRoute = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const token = url.searchParams.get('token');

        if (!token) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Token no proporcionado'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Buscar reserva por token
        const reservasRef = collection(db, 'reservas');
        const q = query(reservasRef, where('cancelToken', '==', token));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Reserva no encontrada'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const doc = querySnapshot.docs[0];
        const reserva: any = { id: doc.id, ...doc.data() };

        // Verificar que no esté ya cancelada
        if (reserva.estado === 'cancelada') {
            return new Response(JSON.stringify({
                success: false,
                error: 'Esta reserva ya fue cancelada'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({
            success: true,
            reserva
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('Error al verificar token:', error);

        return new Response(JSON.stringify({
            success: false,
            error: 'Error al verificar la reserva'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
