// Componente de reserva con manejo de estado vanilla JS
// Para evitar complejidad, usamos JS puro con Web Components

export function createApp(container: HTMLElement) {
  // Estado de la aplicación
  let selectedDate = '';
  let selectedTime = '';
  let reservasDelDia: any[] = [];

  // Renderizar la aplicación
  render();

  function render() {
    container.innerHTML = `
      <div class="space-y-6">
        <!-- Paso 1: Seleccionar Fecha -->
        <div class="step-section">
          <h2 class="text-2xl font-display font-bold mb-4 flex items-center gap-2">
            <span class="badge badge-lg badge-primary">1</span>
            Selecciona una Fecha
          </h2>
          <input
            type="date"
            id="date-picker"
            class="input input-lg w-full"
            min="${getTodayDate()}"
            max="${getMaxDate()}"
            value="${selectedDate}"
            placeholder="Selecciona una fecha"
            required
          />
          <p class="text-sm text-gray-400 mt-2">Selecciona una fecha para ver horarios disponibles</p>
        </div>

        <!-- Paso 2: Seleccionar Hora -->
        ${selectedDate ? renderTimeSlots() : ''}

        <!-- Paso 3: Formulario de Cliente -->
        ${selectedDate && selectedTime ? renderClientForm() : ''}
      </div>
    `;

    setupEventListeners();
  }

  function renderTimeSlots() {
    const horarios = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '15:00', '15:30', '16:00', '16:30',
      '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
    ];

    const ocupados = reservasDelDia.map(r => r.hora);

    return `
      <div class="step-section fade-in">
        <h2 class="text-2xl font-display font-bold mb-4 flex items-center gap-2">
          <span class="badge badge-primary badge-lg">2</span>
          Selecciona un Horario
        </h2>
        <div class="grid grid-cols-3 md:grid-cols-4 gap-3">
          ${horarios.map(hora => {
      const isOcupado = ocupados.includes(hora);
      const isSelected = hora === selectedTime;
      return `
              <button
                class="btn ${isSelected ? 'btn-primary' : 'btn-outline'} ${isOcupado ? 'btn-disabled opacity-50' : ''}"
                data-time="${hora}"
                ${isOcupado ? 'disabled' : ''}
              >
                ${hora}
                ${isOcupado ? '<br/><span class="text-xs">Ocupado</span>' : ''}
              </button>
            `;
    }).join('')}
        </div>
      </div>
    `;
  }

  function renderClientForm() {
    return `
      <div class="step-section fade-in">
        <h2 class="text-2xl font-display font-bold mb-4 flex items-center gap-2">
          <span class="badge badge-primary badge-lg">3</span>
          Tus Datos
        </h2>
        <form id="client-form" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold text-gray-300">Nombre Completo</span>
            </label>
            <input
              type="text"
              name="nombre"
              placeholder="Juan Pérez"
              class="input w-full"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold text-gray-300">Teléfono</span>
            </label>
            <input
              type="tel"
              name="telefono"
              placeholder="+52 123 456 7890"
              class="input w-full"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold text-gray-300">Servicio</span>
            </label>
            <select name="servicio" class="select w-full">
              <option value="Corte de Cabello">Corte de Cabello</option>
              <option value="Arreglo de Barba">Arreglo de Barba</option>
              <option value="Corte + Barba">Corte + Barba</option>
              <option value="Afeitado Clásico">Afeitado Clásico</option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold text-gray-300">Notas (Opcional)</span>
            </label>
            <textarea
              name="notas"
              placeholder="¿Alguna preferencia especial?"
              class="textarea w-full"
              rows="3"
            ></textarea>
          </div>

          <div class="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>El pago se realiza en efectivo en el local</span>
          </div>

          <button type="submit" class="btn btn-primary btn-lg w-full shadow-gold">
            ✂️ Confirmar Reserva
          </button>
        </form>
      </div>
    `;
  }

  function setupEventListeners() {
    // Listener para cambio de fecha
    const datePicker = document.getElementById('date-picker') as HTMLInputElement;
    if (datePicker) {
      datePicker.addEventListener('change', async (e) => {
        selectedDate = (e.target as HTMLInputElement).value;
        selectedTime = '';

        // Cargar reservas del día
        await cargarReservasDelDia();
        render();
      });
    }

    // Listeners para horarios
    const timeButtons = container.querySelectorAll('[data-time]');
    timeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        selectedTime = (e.currentTarget as HTMLElement).dataset.time || '';
        render();
      });
    });

    // Listener para formulario
    const form = document.getElementById('client-form');
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }
  }

  async function cargarReservasDelDia() {
    try {
      const response = await fetch(`/api/reservas?fecha=${selectedDate}`);
      const data = await response.json();

      if (data.success) {
        reservasDelDia = data.reservas;
      }
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    }
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // Mostrar loading
    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading loading-spinner"></span> Procesando...';

    try {
      const response = await fetch('/api/reservar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha: selectedDate,
          hora: selectedTime,
          cliente: {
            nombre: formData.get('nombre'),
            telefono: formData.get('telefono'),
          },
          servicio: formData.get('servicio'),
          notas: formData.get('notas'),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Mostrar éxito
        mostrarExito(data.reservaId, data.cancelUrl);
      } else {
        throw new Error(data.error || 'Error al crear la reserva');
      }
    } catch (error: any) {
      // Mostrar error
      alert('Error: ' + error.message);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }

  function mostrarExito(reservaId: string, cancelUrl?: string) {
    container.innerHTML = `
      <div class="text-center py-12 fade-in">
        <div class="text-6xl mb-6">✅</div>
        <h2 class="text-3xl font-display font-bold mb-4 text-primary">
          ¡Reserva Confirmada!
        </h2>
        <p class="text-lg mb-6">
          Tu cita ha sido agendada exitosamente para:<br/>
          <strong class="text-primary">${formatearFecha(selectedDate)}</strong> a las <strong class="text-primary">${selectedTime}</strong>
        </p>
        ${cancelUrl ? `
        <div class="alert alert-info mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div class="text-sm">
            <p>¿Necesitas cancelar?</p>
            <a href="${cancelUrl}" class="link link-primary">Haz clic aquí para cancelar tu reserva</a>
          </div>
        </div>
        ` : ''}
        <p class="text-sm opacity-70 mb-8">
          ID de reserva: ${reservaId}
        </p>
        <button onclick="location.reload()" class="btn btn-primary">
          Hacer otra reserva
        </button>
      </div>
    `;
  }

  // Utilidades
  function getTodayDate() {
    return new Date().toISOString().split('T')[0];
  }

  function getMaxDate() {
    const date = new Date();
    date.setDate(date.getDate() + 30); // 30 días adelante
    return date.toISOString().split('T')[0];
  }

  function formatearFecha(fecha: string) {
    const [year, month, day] = fecha.split('-');
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${day} de ${meses[parseInt(month) - 1]} de ${year}`;
  }
}
