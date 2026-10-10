// Respuesta del backend para un evento (EventoResponseDTO)
export interface Evento {
    id: number;
    titulo: string;
    descripcion: string;
    // LocalDateTime sin zona horaria, por ejemplo "2026-10-20T14:30:00"
    fechaInicio: string;
    ubicacion: string;
    cuposMaximos: number;
    cuposDisponibles: number;
    estado: string;
    organizadorId: number;
    organizadorNombre: string;
    categoriaId: number | null;
    categoriaNombre: string | null;
}

// Cuerpo de POST /eventos (todos los campos son obligatorios)
export interface EventoSolicitud {
    titulo: string;
    descripcion: string;
    fechaInicio: string;
    ubicacion: string;
    cuposMaximos: number;
    categoriaId: number;
}

// Cuerpo de PUT /eventos/{id}: solo se envían los campos que cambiaron
export type EventoActualizacion = Partial<EventoSolicitud>;

// Respuesta de crear y editar
export interface RespuestaEvento {
    mensaje: string;
    eventoId: number;
}
