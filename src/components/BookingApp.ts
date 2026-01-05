// Componente de reserva con manejo de estado vanilla JS
// Para evitar complejidad, usamos JS puro con Web Components

export function createApp(container: HTMLElement) {
  // Importar estilos del calendario y reloj
  import('../styles/calendar-clock.css');

  // Estado de la aplicación
  let selectedDate = '';
  let selectedTime = '';
  let reservasDelDia: any[] = [];

  // Estado del calendario
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  // Renderizar la aplicación
  render();

  function render() {
    container.innerHTML = `
      <div class="space-y-6">
        <!-- Paso 1: Seleccionar Fecha con Calendario -->
        <div class="step-section">
          <h2 class="text-2xl font-display font-bold mb-4 flex items-center gap-2">
            <span class="badge badge-lg badge-primary">1</span>
            Selecciona una Fecha
          </h2>
          ${renderCalendar()}
        </div>

        <!-- Paso 2: Seleccionar Hora -->
        ${selectedDate ? renderTimeSlots() : ''}

        <!-- Paso 3: Formulario de Cliente -->
        ${selectedDate && selectedTime ? renderClientForm() : ''}
      </div>
    `;

    setupEventListeners();
  }

  function renderCalendar() {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const today = new Date();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const prevLastDay = new Date(currentYear, currentMonth, 0);

    const firstDayIndex = firstDay.getDay();
    const lastDateNum = lastDay.getDate();
    const prevLastDateNum = prevLastDay.getDate();

    let daysHTML = '';

    // Días del mes anterior
    for (let i = firstDayIndex; i > 0; i--) {
      daysHTML += `<div class="calendar-day other-month">${prevLastDateNum - i + 1}</div>`;
    }

    // Días del mes actual
    for (let day = 1; day <= lastDateNum; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(currentYear, currentMonth, day);
      const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isToday = dateObj.toDateString() === today.toDateString();
      const isSelected = dateStr === selectedDate;

      const classes = [
        'calendar-day',
        isPast && 'disabled',
        isToday && 'today',
        isSelected && 'selected'
      ].filter(Boolean).join(' ');

      daysHTML += `
        <div class="${classes}" data-date="${dateStr}" ${isPast ? '' : `onclick="selectDate('${dateStr}')"`}>
          ${day}
        </div>`;
    }

    const today_date = new Date();
    const isPrevDisabled = (currentYear === today_date.getFullYear() && currentMonth <= today_date.getMonth());

    return `
      <div class="calendar-container">
        <div class="calendar-header">
          <button 
            class="calendar-nav-btn" 
            id="prev-month"
            ${isPrevDisabled ? 'disabled' : ''}
          >◀</button>
          <div class="calendar-month-title">
            ${monthNames[currentMonth]} ${currentYear}
          </div>
          <button class="calendar-nav-btn" id="next-month">▶</button>
        </div>
        
        <div class="calendar-weekdays">
          <div class="calendar-weekday">Dom</div>
          <div class="calendar-weekday">Lun</div>
          <div class="calendar-weekday">Mar</div>
          <div class="calendar-weekday">Mié</div>
          <div class="calendar-weekday">Jue</div>
          <div class="calendar-weekday">Vie</div>
          <div class="calendar-weekday">Sáb</div>
        </div>
        
        <div class="calendar-days">
          ${daysHTML}
        </div>
      </div>
    `;
  }

  function renderTimeSlots() {
    return `
      <div class="step-section fade-in">
        <h2 class="text-2xl font-display font-bold mb-4 flex items-center gap-2">
          <span class="badge badge-primary badge-lg">2</span>
          Selecciona un Horario
        </h2>
        ${renderAnalogClock()}
      </div>
    `;
  }

  function renderAnalogClock() {
    const horarios = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '15:00', '15:30', '16:00', '16:30',
      '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
    ];

    const ocupados = reservasDelDia.map(r => r.hora);

    // Calcular ángulos de las manecillas si hay hora seleccionada
    let hourAngle = 0;
    let minuteAngle = 0;

    if (selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      hourAngle = (hours % 12) * 30 + (minutes / 60) * 30; // 30° por hora
      minuteAngle = minutes * 6; // 6° por minuto
    }

    return `
      <div class="clock-container">
        <svg class="clock-svg" id="analog-clock" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <!-- Cara del reloj -->
          <circle class="clock-face" cx="200" cy="200" r="180" />
          
          <!-- Marcadores de hora (círculos clickeables) -->
          ${generateHourMarkers(horarios, ocupados)}
          
          <!-- Ticks de minutos -->
          ${generateMinuteTicks()}
          
          <!-- Números de hora -->
          ${generateClockNumbers()}
          
          <!-- Manecilla de horas -->
          <line 
            class="clock-hand hour" 
            id="hour-hand"
            x1="200" y1="200" 
            x2="200" y2="100"
            transform="rotate(${hourAngle} 200 200)"
          />
          
          <!-- Manecilla de minutos -->
          <line 
            class="clock-hand minute" 
            id="minute-hand"
            x1="200" y1="200" 
            x2="200" y2="70"
            transform="rotate(${minuteAngle} 200 200)"
          />
          
          <!-- Centro del reloj -->
          <circle class="clock-center" cx="200" cy="200" r="8" />
        </svg>
        
        <div class="selected-time-display">
          ${selectedTime || '--:--'}
        </div>
        
        <div class="mt-4 w-full max-w-xs mx-auto">
          <label class="block text-sm text-gray-400 mb-2 text-center">
            O ingresa la hora manualmente:
          </label>
          <select 
            id="manual-time-input" 
            class="select w-full text-center text-lg"
          >
            <option value="">-- Selecciona --</option>
            ${horarios.map(hora => {
      const isOcupado = ocupados.includes(hora);
      return `<option value="${hora}" ${isOcupado ? 'disabled' : ''} ${hora === selectedTime ? 'selected' : ''}>
                ${hora} ${isOcupado ? '(Ocupado)' : ''}
              </option>`;
    }).join('')}
          </select>
        </div>
        
        <p class="text-sm text-gray-400 mt-2 text-center">
          Haz clic en el reloj o selecciona la hora
        </p>
      </div>
    `;
  }

  function generateHourMarkers(horarios: string[], ocupados: string[]) {
    // Generar marcadores invisibles pero clickeables para cada hora disponible
    return horarios.map(hora => {
      const [hours, minutes] = hora.split(':').map(Number);
      const angle = (hours % 12) * 30 + (minutes / 60) * 30 - 90; // -90 para empezar desde arriba
      const radians = (angle * Math.PI) / 180;
      const radius = 140;
      const x = 200 + radius * Math.cos(radians);
      const y = 200 + radius * Math.sin(radians);
      const isOcupado = ocupados.includes(hora);

      return `
        <circle 
          class="clock-hour-marker ${isOcupado ? 'occupied' : ''}" 
          cx="${x}" 
          cy="${y}" 
          r="15"
          data-time="${hora}"
          opacity="0.2"
          ${isOcupado ? '' : 'style="cursor:pointer;"'}
        />
      `;
    }).join('');
  }

  function generateMinuteTicks() {
    let ticks = '';
    for (let i = 0; i < 60; i++) {
      const angle = i * 6 - 90;
      const radians = (angle * Math.PI) / 180;
      const isMajor = i % 5 === 0;
      const startRadius = isMajor ? 160 : 165;
      const endRadius = isMajor ? 170 : 168;

      const x1 = 200 + startRadius * Math.cos(radians);
      const y1 = 200 + startRadius * Math.sin(radians);
      const x2 = 200 + endRadius * Math.cos(radians);
      const y2 = 200 + endRadius * Math.sin(radians);

      ticks += `<line class="clock-tick ${isMajor ? 'major' : ''}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
    }
    return ticks;
  }

  function generateClockNumbers() {
    let numbers = '';
    for (let i = 1; i <= 12; i++) {
      const angle = i * 30 - 90;
      const radians = (angle * Math.PI) / 180;
      const radius = 145;
      const x = 200 + radius * Math.cos(radians);
      const y = 200 + radius * Math.sin(radians);

      numbers += `<text class="clock-number" x="${x}" y="${y + 6}">${i}</text>`;
    }
    return numbers;
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
              pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,50}"
              title="Solo letras y espacios (2-50 caracteres)"
              maxlength="50"
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
              pattern="[\+]?[0-9]{10,15}"
              title="Número válido de 10-15 dígitos (puede incluir +)"
              maxlength="15"
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
    // Listeners para navegación del calendario
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
          currentMonth = 11;
          currentYear--;
        }
        render();
      });
    }

    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
        }
        render();
      });
    }

    // Listeners para selección de fecha en calendario
    const calendarDays = container.querySelectorAll('.calendar-day:not(.disabled):not(.other-month)');
    calendarDays.forEach(day => {
      day.addEventListener('click', async () => {
        const dateStr = (day as HTMLElement).dataset.date;
        if (dateStr) {
          selectedDate = dateStr;
          selectedTime = '';

          // Cargar reservas del día
          await cargarReservasDelDia();
          render();
        }
      });
    });

    // Listeners para selección de hora en el reloj
    const hourMarkers = container.querySelectorAll('.clock-hour-marker:not(.occupied)');
    hourMarkers.forEach(marker => {
      marker.addEventListener('click', () => {
        const time = (marker as SVGElement).dataset.time;
        if (time) {
          selectedTime = time;
          render();
        }
      });
    });

    // Listener para input manual de hora
    const manualTimeInput = document.getElementById('manual-time-input') as HTMLSelectElement;
    if (manualTimeInput) {
      manualTimeInput.addEventListener('change', (e) => {
        const time = (e.target as HTMLSelectElement).value;
        if (time) {
          selectedTime = time;
          render();
        }
      });
    }

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

    // Validaciones adicionales
    const nombre = formData.get('nombre') as string;
    const telefono = formData.get('telefono') as string;
    const notas = formData.get('notas') as string;

    // Validar nombre (solo letras)
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(nombre)) {
      alert('❌ El nombre solo puede contener letras');
      return;
    }

    // Validar teléfono (números y +)
    if (!/^[\+]?[0-9]{10,15}$/.test(telefono.replace(/\s/g, ''))) {
      alert('❌ Por favor ingresa un número de teléfono válido (10-15 dígitos)');
      return;
    }

    // Filtro básico de contenido inapropiado en notas
    const palabrasProhibidas = ['banco', 'tarjeta', 'contraseña', 'password', 'cuenta bancaria',
      'cvv', 'pin', 'nip'];
    const notasLower = notas.toLowerCase();
    const tieneProhibidas = palabrasProhibidas.some(palabra => notasLower.includes(palabra));

    if (tieneProhibidas) {
      alert('⚠️ Por favor no incluyas información sensible como datos bancarios o contraseñas en las notas');
      return;
    }

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
    // Guardar en localStorage
    guardarReservaLocal(reservaId);

    container.innerHTML = `
      <div class="text-center py-12 fade-in">
        <svg class="w-24 h-24 mx-auto mb-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h2 class="text-3xl font-display font-bold mb-4 text-primary">
          ¡Reserva Solicitada!
        </h2>
        <p class="text-lg mb-6">
          Tu cita ha sido agendada exitosamente para:<br/>
          <strong class="text-primary">${formatearFecha(selectedDate)}</strong> a las <strong class="text-primary">${selectedTime}</strong>
        </p>
        
        <!-- Mensaje de pendiente -->
        <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6 max-w-md mx-auto">
          <div class="flex items-start gap-3 text-left">
            <svg class="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <p class="font-bold text-blue-400 mb-1">Pendiente de Confirmación</p>
              <p class="text-sm text-gray-300">El administrador revisará tu solicitud y te confirmará pronto.</p>
            </div>
          </div>
        </div>
        
        <!-- Link para consultar estado -->
        <div class="bg-primary/10 border border-primary/30 rounded-lg p-6 mb-6">
          <p class="text-sm text-gray-300 mb-3 flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <strong>Consulta tu reserva:</strong>
          </p>
          <div class="flex flex-col gap-2">
            <a 
              href="/reserva/${reservaId}" 
              target="_blank"
              class="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              Ver Estado de mi Reserva
            </a>
            <button 
              onclick="copiarLinkReserva('${reservaId}')" 
              class="btn btn-outline btn-sm w-full flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
              </svg>
              Copiar Link
            </button>
          </div>
        </div>

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

  // Función para guardar reserva en localStorage
  function guardarReservaLocal(id: string) {
    const reservaData = {
      id: id,
      timestamp: Date.now()
    };
    localStorage.setItem('barber_reserva_activa', JSON.stringify(reservaData));
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

  // Función global para copiar link de reserva
  (window as any).copiarLinkReserva = (reservaId: string) => {
    const url = `${window.location.origin}/reserva/${reservaId}`;

    // Método moderno
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        alert('✅ Link copiado al portapapeles');
      });
    } else {
      // Fallback para navegadores antiguos
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('✅ Link copiado al portapapeles');
    }
  };
}
