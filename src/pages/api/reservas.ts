// API Route para obtener reservas de un día específico
// Ruta: GET /api/reservas?fecha=2024-01-15

import type { APIRoute } from 'astro';
import { db } from '../../firebase/client';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export const GET: APIRoute = async ({ url }) => {
    try {
        const fecha = url.searchParams.get('fecha');

        if (!fecha) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Parámetro "fecha" es requerido (formato: YYYY-MM-DD)'
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Consultar reservas del día
        const reservasRef = collection(db, 'reservas');
        const q = query(
            reservasRef,
            where('fecha', '==', fecha),
            where('estado', 'in', ['pendiente', 'confirmada']),
            orderBy('hora', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const reservas = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        return new Response(
            JSON.stringify({
                success: true,
                fecha,
                reservas,
                total: reservas.length,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error al obtener reservas:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Error al obtener las reservas'
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
