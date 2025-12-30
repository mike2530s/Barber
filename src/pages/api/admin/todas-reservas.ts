// API Admin: Obtener todas las reservas
// GET /api/admin/todas-reservas

import type { APIRoute } from 'astro';
import { db } from '../../../firebase/client';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export const GET: APIRoute = async () => {
    try {
        // Obtener fecha de hace 30 días
        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);
        const fechaLimite = hace30Dias.toISOString().split('T')[0];

        const reservasRef = collection(db, 'reservas');
        const q = query(
            reservasRef,
            where('fecha', '>=', fechaLimite),
            orderBy('fecha', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const reservas = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return new Response(JSON.stringify({
            success: true,
            reservas,
            total: reservas.length
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('Error al obtener reservas:', error);

        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Error al obtener las reservas'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
