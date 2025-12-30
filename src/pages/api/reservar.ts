// FASE 3: API Backend - Endpoint para crear reservas
// Ruta: POST /api/reservar

import type { APIRoute } from 'astro';
import { db } from '../../firebase/client';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import type { Reserva } from '../../types/booking';

export const POST: APIRoute = async ({ request }) => {
    try {
        // 1. Obtener datos del formulario
        const body = await request.json();
        const { fecha, hora, cliente, servicio, notas } = body;

        // 2. Validar datos requeridos
        if (!fecha || !hora || !cliente?.nombre || !cliente?.telefono) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Faltan datos requeridos (fecha, hora, nombre, teléfono)'
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 3. Verificar que el horario esté disponible
        const reservasRef = collection(db, 'reservas');
        const q = query(
            reservasRef,
            where('fecha', '==', fecha),
            where('hora', '==', hora),
            where('estado', 'in', ['pendiente', 'confirmada'])
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Este horario ya está reservado. Por favor, elige otro.'
                }),
                { status: 409, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 4. Generar token único para cancelación
        const cancelToken = generarTokenUnico();

        // 5. Crear objeto de reserva
        const nuevaReserva: Omit<Reserva, 'id'> = {
            fecha,
            hora,
            cliente: {
                nombre: cliente.nombre.trim(),
                telefono: cliente.telefono.trim(),
            },
            servicio: servicio || 'Corte de Cabello',
            estado: 'pendiente',
            createdAt: Date.now(),
            notas: notas?.trim() || '',
            cancelToken,
        };

        // 6. Guardar en Firestore
        const docRef = await addDoc(reservasRef, nuevaReserva);

        // 7. Enviar notificación a Telegram
        const telegramSuccess = await enviarNotificacionTelegram({
            ...nuevaReserva,
            id: docRef.id,
        });

        // 8. Responder con éxito (incluye link de cancelación)
        const baseUrl = new URL(request.url).origin;
        const cancelUrl = `${baseUrl}/cancelar/${cancelToken}`;

        return new Response(
            JSON.stringify({
                success: true,
                reservaId: docRef.id,
                mensaje: 'Reserva creada exitosamente',
                telegramEnviado: telegramSuccess,
                cancelUrl,
            }),
            { status: 201, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error al crear reserva:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Error interno del servidor al procesar la reserva'
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

// Función para enviar notificación a Telegram
async function enviarNotificacionTelegram(reserva: Reserva): Promise<boolean> {
    try {
        const botToken = import.meta.env.TELEGRAM_BOT_TOKEN;
        const chatId = import.meta.env.TELEGRAM_CHAT_ID;

        // Si no hay configuración de Telegram, no enviar (pero no fallar)
        if (!botToken || !chatId) {
            console.warn('Telegram no configurado. Saltando notificación.');
            return false;
        }

        // Generar URL de cancelación
        const baseUrl = import.meta.env.PUBLIC_URL || 'http://localhost:4321';
        const cancelUrl = `${baseUrl}/cancelar/${(reserva as any).cancelToken}`;

        // Formatear mensaje en texto plano (Telegram auto-detecta URLs)
        const notasTexto = reserva.notas ? `\n📝 Notas: ${reserva.notas}\n` : '';

        const mensaje = `🔔 *Nueva Reserva - Barbería*

📅 Fecha: ${formatearFecha(reserva.fecha)}
🕐 Hora: ${reserva.hora}

👤 Cliente: ${reserva.cliente.nombre}
📱 Teléfono: ${reserva.cliente.telefono}
✂️ Servicio: ${reserva.servicio}${notasTexto}
🆔 ID: ${reserva.id}

🔗 Link para cancelar:
${cancelUrl}`;

        // Enviar a Telegram
        const response = await fetch(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: mensaje,
                    parse_mode: 'Markdown',
                }),
            }
        );

        if (!response.ok) {
            console.error('Error al enviar mensaje a Telegram:', await response.text());
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error en notificación de Telegram:', error);
        return false;
    }
}

// Función auxiliar para formatear fecha
function formatearFecha(fecha: string): string {
    const [year, month, day] = fecha.split('-');
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${day} de ${meses[parseInt(month) - 1]} de ${year}`;
}

// Función para generar token único
function generarTokenUnico(): string {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15) +
        Date.now().toString(36);
}
