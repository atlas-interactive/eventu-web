export type EstadoInscripcion = 'ACTIVA' | 'CANCELADA';

export interface Inscripcion {
    id: number;
    estado: EstadoInscripcion;
    codigoQr: string | null;
    fechaInscripcion: string;
    eventoId: number;
    eventoTitulo: string;
    eventoFechaInicio: string;
    eventoUbicacion: string;
}

export interface RespuestaCancelacionInscripcion {
    mensaje: string;
    inscripcionId: number;
}
