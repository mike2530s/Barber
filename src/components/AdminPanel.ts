// Componente de administración - Gestión de reservas
// Maneja la lógica del panel de admin

export function initAdminPanel() {
    let todasLasReservas: any[] = [];
    let reservasFiltradas: any[] = [];

    // Cargar reservas al iniciar
    cargarReservas();

    // Event listeners
    document.getElementById('btn-filtrar')?.addEventListener('click', aplicarFiltros);

    async function cargarReservas() {
        try {
            const loading = document.getElementById('loading');
            const container = document.getElementById('reservas-container');
            const noReservas = document.getElementById('no-reservas');

            if (loading) loading.classList.remove('hidden');
            if (container) container.classList.add('hidden');
            if (noReservas) noReservas.classList.add('hidden');

            // Obtener todas las reservas (últimos 30 días)
            const response = await fetch('/api/admin/todas-reservas');
            const data = await response.json();

            if (data.success) {
                todasLasReservas = data.reservas;
                reservasFiltradas = todasLasReservas;

                actualizarEstadisticas();
                renderizarReservas();

                if (loading) loading.classList.add('hidden');
                if (todasLasReservas.length === 0) {
                    if (noReservas) noReservas.classList.remove('hidden');
                } else {
                    if (container) container.classList.remove('hidden');
                }
            }
        } catch (error) {
            console.error('Error al cargar reservas:', error);
            alert('Error al cargar las reservas');
        }
    }

    function aplicarFiltros() {
        const fechaDesde = (document.getElementById('fecha-desde') as HTMLInputElement)?.value;
        const fechaHasta = (document.getElementById('fecha-hasta') as HTMLInputElement)?.value;
        const estado = (document.getElementById('filtro-estado') as HTMLSelectElement)?.value;

        reservasFiltradas = todasLasReservas.filter(reserva => {
            let cumpleFiltro = true;

            if (fechaDesde && reserva.fecha < fechaDesde) cumpleFiltro = false;
            if (fechaHasta && reserva.fecha > fechaHasta) cumpleFiltro = false;
            if (estado !== 'todas' && reserva.estado !== estado) cumpleFiltro = false;

            return cumpleFiltro;
        });

        actualizarEstadisticas();
        renderizarReservas();
    }

    function actualizarEstadisticas() {
        const stats = {
            total: reservasFiltradas.length,
            pendientes: reservasFiltradas.filter(r => r.estado === 'pendiente').length,
            confirmadas: reservasFiltradas.filter(r => r.estado === 'confirmada').length,
            completadas: reservasFiltradas.filter(r => r.estado === 'completada').length,
        };

        document.getElementById('stat-total')!.textContent = stats.total.toString();
        document.getElementById('stat-pendientes')!.textContent = stats.pendientes.toString();
        document.getElementById('stat-confirmadas')!.textContent = stats.confirmadas.toString();
        document.getElementById('stat-completadas')!.textContent = stats.completadas.toString();
    }

    function renderizarReservas() {
        const tbody = document.getElementById('reservas-tbody');
        if (!tbody) return;

        // Ordenar por fecha y hora (más recientes primero)
        const reservasOrdenadas = [...reservasFiltradas].sort((a, b) => {
            const dateA = new Date(`${a.fecha}T${a.hora}`);
            const dateB = new Date(`${b.fecha}T${b.hora}`);
            return dateB.getTime() - dateA.getTime();
        });

        tbody.innerHTML = reservasOrdenadas.map(reserva => `
      <tr>
        <td>${formatearFecha(reserva.fecha)}</td>
        <td class="font-semibold">${reserva.hora}</td>
        <td>${reserva.cliente.nombre}</td>
        <td>${reserva.cliente.telefono}</td>
        <td>${reserva.servicio}</td>
        <td>
          <span class="badge ${getBadgeColor(reserva.estado)}">
            ${reserva.estado}
          </span>
        </td>
        <td>
          <div class="flex gap-2">
            ${reserva.estado !== 'completada' ? `
              <button 
                class="btn btn-sm btn-primary"
                onclick="window.marcarCompletada('${reserva.id}')"
              >
                ✓ Completar
              </button>
            ` : ''}
            <button 
              class="btn btn-sm btn-outline"
              onclick="window.verDetalles('${reserva.id}')"
            >
              Ver detalles
            </button>
          </div>
        </td>
      </tr>
    `).join('');
    }

    function getBadgeColor(estado: string): string {
        const colores: Record<string, string> = {
            pendiente: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            confirmada: 'bg-green-500/20 text-green-400 border-green-500/30',
            completada: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            cancelada: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        return colores[estado] || '';
    }

    function formatearFecha(fecha: string): string {
        const [year, month, day] = fecha.split('-');
        const meses = [
            'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
        ];
        return `${day} ${meses[parseInt(month) - 1]} ${year}`;
    }

    // Funciones globales para los botones
    (window as any).marcarCompletada = async (id: string) => {
        if (!confirm('¿Marcar esta reserva como completada?')) return;

        try {
            const response = await fetch('/api/admin/actualizar-estado', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, estado: 'completada' })
            });

            const data = await response.json();
            if (data.success) {
                alert('✅ Reserva marcada como completada');
                cargarReservas();
            }
        } catch (error) {
            alert('Error al actualizar la reserva');
        }
    };

    (window as any).verDetalles = (id: string) => {
        const reserva = todasLasReservas.find(r => r.id === id);
        if (!reserva) return;

        const detalles = `
📋 DETALLES DE LA RESERVA

ID: ${reserva.id}
Fecha: ${formatearFecha(reserva.fecha)}
Hora: ${reserva.hora}
Estado: ${reserva.estado.toUpperCase()}

👤 CLIENTE
Nombre: ${reserva.cliente.nombre}
Teléfono: ${reserva.cliente.telefono}

✂️ SERVICIO
${reserva.servicio}

${reserva.notas ? `📝 NOTAS:\n${reserva.notas}` : ''}
    `;

        alert(detalles);
    };
}
