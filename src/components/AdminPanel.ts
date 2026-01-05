// Componente de administración - Gestión de reservas
// Maneja la lógica del panel de admin

export function initAdminPanel() {
    let todasLasReservas: any[] = [];
    let reservasFiltradas: any[] = [];

    // Cargar reservas al iniciar
    cargarReservas();

    // Event listeners
    document.getElementById('btn-filtrar')?.addEventListener('click', aplicarFiltros);

    // Función para configurar event delegation
    function configurarEventDelegation() {
        const tbody = document.getElementById('reservas-tbody');
        if (tbody) {
            tbody.addEventListener('click', async (e) => {
                const target = e.target as HTMLElement;
                const button = target.closest('button');
                if (!button) return;

                const reservaId = button.getAttribute('data-reserva-id');
                if (!reservaId) return;

                if (button.classList.contains('btn-confirmar')) {
                    await confirmarReserva(reservaId);
                } else if (button.classList.contains('btn-completar')) {
                    await marcarCompletada(reservaId);
                } else if (button.classList.contains('btn-cancelar')) {
                    mostrarModalCancelar(reservaId);
                } else if (button.classList.contains('btn-detalles')) {
                    verDetalles(reservaId);
                }
            });
            console.log('Event delegation configurado en tbody');
        } else {
            console.error('No se encontró tbody para event delegation');
        }
    }

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

                // Configurar event delegation DESPUÉS de renderizar
                configurarEventDelegation();
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
            ${reserva.estado === 'pendiente' ? `
              <button 
                class="btn btn-sm btn-success btn-confirmar"
                data-reserva-id="${reserva.id}"
              >
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Confirmar
              </button>
            ` : ''}
            
            ${reserva.estado === 'confirmada' ? `
              <button 
                class="btn btn-sm btn-primary btn-completar"
                data-reserva-id="${reserva.id}"
              >
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Completar
              </button>
            ` : ''}
            
            ${reserva.estado !== 'completada' && reserva.estado !== 'cancelada' ? `
              <button 
                class="btn btn-sm btn-error btn-cancelar"
                data-reserva-id="${reserva.id}"
              >
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Cancelar
              </button>
            ` : ''}
            
            <button 
              class="btn btn-sm btn-outline btn-detalles"
              data-reserva-id="${reserva.id}"
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

    // Función para marcar como completada
    async function marcarCompletada(id: string) {
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
    }

    // Función para confirmar reserva
    async function confirmarReserva(id: string) {
        console.log('confirmarReserva llamada con ID:', id);

        if (!confirm('¿Confirmar esta reserva?')) {
            console.log('Usuario canceló la confirmación');
            return;
        }

        console.log('Enviando petición para confirmar...');
        try {
            const response = await fetch('/api/admin/actualizar-estado', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, estado: 'confirmada' })
            });

            console.log('Respuesta recibida:', response.status);
            const data = await response.json();
            console.log('Data:', data);

            if (data.success) {
                alert('✅ Reserva confirmada');
                cargarReservas();
            } else {
                alert('❌ Error: ' + (data.error || 'No se pudo confirmar'));
            }
        } catch (error) {
            console.error('Error en confirmarReserva:', error);
            alert('Error al confirmar la reserva: ' + error);
        }
    }

    function verDetalles(id: string) {
        const reserva = todasLasReservas.find(r => r.id === id);
        if (!reserva) return;

        // Crear modal con steps
        const modalId = `detail-modal-${id}`;
        let existingModal = document.getElementById(modalId);

        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('dialog');
        modal.id = modalId;
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-box max-w-2xl bg-dark-card">
                <h3 class="text-2xl font-bold text-gradient mb-6">Detalles de Reserva</h3>
                
                <!-- Progress Steps -->
                ${renderSteps(reserva.estado)}
                
                <!-- Información de Reserva -->
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="bg-primary/10 p-4 rounded-lg">
                        <p class="text-xs text-gray-400">Fecha</p>
                        <p class="text-lg font-semibold">${formatearFecha(reserva.fecha)}</p>
                    </div>
                    <div class="bg-primary/10 p-4 rounded-lg">
                        <p class="text-xs text-gray-400">Hora</p>
                        <p class="text-lg font-semibold">${reserva.hora}</p>
                    </div>
                </div>

                <!-- Cliente -->
                <div class="mb-6">
                    <h4 class="font-bold text-lg mb-2 flex items-center gap-2">
                        <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                        Cliente
                    </h4>
                    <div class="bg-base-300 p-4 rounded-lg">
                        <p><strong>Nombre:</strong> ${reserva.cliente.nombre}</p>
                        <p><strong>Teléfono:</strong> ${reserva.cliente.telefono}</p>
                    </div>
                </div>

                <!-- Servicio -->
                <div class="mb-6">
                    <h4 class="font-bold text-lg mb-2 flex items-center gap-2">
                        <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 0L4 4m5.121 5.121L4 14"/></svg>
                        Servicio
                    </h4>
                    <div class="bg-base-300 p-4 rounded-lg">
                        <p>${reserva.servicio}</p>
                    </div>
                </div>

                ${reserva.notas ? `
                    <div class="mb-6">
                        <h4 class="font-bold text-lg mb-2 flex items-center gap-2">
                            <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                            Notas
                        </h4>
                        <div class="bg-base-300 p-4 rounded-lg">
                            <p>${reserva.notas}</p>
                        </div>
                    </div>
                ` : ''}

                ${reserva.motivoCancelacion ? `
                    <div class="alert alert-error mb-4">
                        <div>
                            <h4 class="font-bold">Motivo de Cancelación</h4>
                            <p>${reserva.motivoCancelacion}</p>
                        </div>
                    </div>
                ` : ''}

                <!-- ID -->
                <div class="text-center text-xs text-gray-500 mb-4">
                    <p>ID: <code class="bg-base-300 px-2 py-1 rounded">${reserva.id}</code></p>
                </div>

                <div class="modal-action">
                    <form method="dialog">
                        <button class="btn">Cerrar</button>
                    </form>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button>close</button>
            </form>
        `;

        document.body.appendChild(modal);
        (modal as HTMLDialogElement).showModal();
    };

    function renderSteps(estado: string) {
        if (estado === 'cancelada') {
            return `
                <ul class="steps w-full mb-6">
                    <li class="step step-error">Cancelada</li>
                </ul>
            `;
        }

        const stepData: Record<string, number> = {
            'pendiente': 0,
            'confirmada': 1,
            'completada': 2
        };

        const currentIndex = stepData[estado] ?? 0;

        return `
            <ul class="steps steps-vertical lg:steps-horizontal w-full mb-6">
                <li class="step ${currentIndex >= 0 ? 'step-primary' : ''}">
                    Solicitada
                </li>
                <li class="step ${currentIndex >= 1 ? 'step-primary' : ''}">
                    Confirmada
                </li>
                <li class="step ${currentIndex >= 2 ? 'step-primary' : ''}">
                    Completada
                </li>
            </ul>
        `;
    }

    // Función para mostrar modal de cancelación
    function mostrarModalCancelar(id: string) {
        const reserva = todasLasReservas.find(r => r.id === id);
        if (!reserva) return;

        // Llenar información de la reserva en el modal
        const infoDiv = document.getElementById('cancel-reserva-info');
        if (infoDiv) {
            infoDiv.innerHTML = `
                <strong>${reserva.cliente.nombre}</strong><br>
                ${formatearFecha(reserva.fecha)} a las ${reserva.hora}<br>
                Servicio: ${reserva.servicio}
            `;
        }

        // Limpiar textarea
        const reasonTextarea = document.getElementById('cancel-reason') as HTMLTextAreaElement;
        if (reasonTextarea) reasonTextarea.value = '';

        // Guardar ID para usar en confirmación
        (window as any).reservaACancelar = id;

        // Abrir modal
        const modal = document.getElementById('cancel-modal') as HTMLDialogElement;
        if (modal) modal.showModal();
    };

    // Event listener para botón de confirmar cancelación
    document.getElementById('confirm-cancel-btn')?.addEventListener('click', async () => {
        const id = (window as any).reservaACancelar;
        const motivo = (document.getElementById('cancel-reason') as HTMLTextAreaElement)?.value;

        if (!motivo || motivo.trim() === '') {
            alert('⚠️ Por favor ingresa el motivo de cancelación');
            return;
        }

        try {
            const response = await fetch('/api/admin/actualizar-estado', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    estado: 'cancelada',
                    motivoCancelacion: motivo
                })
            });

            const data = await response.json();
            if (data.success) {
                alert('✅ Reserva cancelada correctamente');

                // Cerrar modal
                const modal = document.getElementById('cancel-modal') as HTMLDialogElement;
                if (modal) modal.close();

                // Recargar reservas
                cargarReservas();
            } else {
                alert('❌ Error: ' + (data.error || 'No se pudo cancelar la reserva'));
            }
        } catch (error) {
            console.error('Error al cancelar:', error);
            alert('❌ Error al cancelar la reserva');
        }
    });
}
