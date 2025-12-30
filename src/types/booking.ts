// Tipos TypeScript para las reservas/citas de la barbería

export interface Reserva {
  id?: string;                    // ID del documento en Firestore (generado automáticamente)
  fecha: string;                  // Formato: "2024-01-15" (YYYY-MM-DD)
  hora: string;                   // Formato: "14:30" (HH:mm)
  cliente: {
    nombre: string;               // Nombre completo del cliente
    telefono: string;             // Teléfono con formato: "+52 123 456 7890"
  };
  servicio?: string;              // Opcional: tipo de servicio (corte, barba, combo, etc.)
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  createdAt: number;              // Timestamp de creación (Date.now())
  updatedAt?: number;             // Timestamp de última actualización
  notas?: string;                 // Notas adicionales del cliente
  cancelToken?: string;           // Token único para cancelar la reserva
}

// Estructura del documento en Firestore:
/*
  Colección: "reservas"
  Documento ID: auto-generado por Firestore
  
  Ejemplo de documento:
  {
    "fecha": "2024-01-15",
    "hora": "14:30",
    "cliente": {
      "nombre": "Juan Pérez",
      "telefono": "+52 123 456 7890"
    },
    "servicio": "Corte + Barba",
    "estado": "pendiente",
    "createdAt": 1704467400000,
    "notas": "Prefiere estilo degradado"
  }
*/

// Horarios disponibles de la barbería
export const HORARIOS_DISPONIBLES = [
  '09:00', '09:30',
  '10:00', '10:30',
  '11:00', '11:30',
  '12:00', '12:30',
  '13:00', '13:30', // Pausa para comer
  '15:00', '15:30',
  '16:00', '16:30',
  '17:00', '17:30',
  '18:00', '18:30',
  '19:00', '19:30',
];

// Días de la semana que abre la barbería (0 = Domingo, 6 = Sábado)
export const DIAS_ABIERTOS = [1, 2, 3, 4, 5, 6]; // Lunes a Sábado

// Servicios disponibles
export const SERVICIOS = [
  { id: 'corte', nombre: 'Corte de Cabello', duracion: 30 },
  { id: 'barba', nombre: 'Arreglo de Barba', duracion: 20 },
  { id: 'combo', nombre: 'Corte + Barba', duracion: 45 },
  { id: 'afeitado', nombre: 'Afeitado Clásico', duracion: 30 },
];
