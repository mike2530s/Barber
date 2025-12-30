// API: Procesar cancelación de reserva
// POST /api/cancelar/procesar

import type { APIRoute } from 'astro';
import { db } from '../../../firebase/client';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { token } = body;

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

        const reservaDoc = querySnapshot.docs[0];
        const reserva: any = { id: reservaDoc.id, ...reservaDoc.data() };

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

        // Actualizar estado a cancelada
        const reservaRef = doc(db, 'reservas', reservaDoc.id);
        await updateDoc(reservaRef, {
            estado: 'cancelada',
            canceladaEn: new Date().toISOString()
        });

        // Enviar notificación de Telegram
        await enviarNotificacionCancelacion(reserva);

        return new Response(JSON.stringify({
            success: true,
            message: 'Reserva cancelada exitosamente'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('Error al cancelar reserva:', error);

        return new Response(JSON.stringify({
            success: false,
            error: 'Error al cancelar la reserva'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

async function enviarNotificacionCancelacion(reserva: any): Promise<boolean> {
    try {
        const botToken = import.meta.env.TELEGRAM_BOT_TOKEN;
        const chatId = import.meta.env.TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            console.warn('Telegram no configurado');
            return false;
        }

        const mensaje = `
🚫 <b>Reserva Cancelada</b>

📅 Fecha: ${reserva.fecha}
🕐 Hora: ${reserva.hora}

👤 Cliente: ${reserva.cliente.nombre}
📱 Teléfono: ${reserva.cliente.telefono}
✂️ Servicio: ${reserva.servicio}

🆔 ID: ${reserva.id}
    `.trim();

        const response = await fetch(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: mensaje,
                    parse_mode: 'HTML'
                })
            }
        );

        return response.ok;
    } catch (error) {
        console.error('Error al enviar notificación de Telegram:', error);
        return false;
    }
}
