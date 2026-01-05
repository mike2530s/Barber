import type { APIRoute } from 'astro';
import { db } from '../../../firebase/client';
import { doc, getDoc } from 'firebase/firestore';

export const GET: APIRoute = async ({ params }) => {
    try {
        const { id } = params;

        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                error: 'ID de reserva requerido'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Obtener reserva de Firestore
        const reservaRef = doc(db, 'reservas', id);
        const reservaSnap = await getDoc(reservaRef);

        if (!reservaSnap.exists()) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Reserva no encontrada'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const reservaData = reservaSnap.data();

        return new Response(JSON.stringify({
            success: true,
            reserva: {
                id: reservaSnap.id,
                ...reservaData
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('Error al obtener reserva:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Error al obtener la reserva'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
