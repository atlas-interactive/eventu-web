import { axiosClient } from '../../../api';
import type { Inscripcion, RespuestaCancelacionInscripcion } from '../../../types/inscripcion';

export interface RespuestaInscripcion {
    mensaje: string;
    inscripcionId: number;
    codigoQr: string;
}

export const inscribirEnEvento = async (eventoId: number): Promise<RespuestaInscripcion> => {
    const { data } = await axiosClient.post<RespuestaInscripcion>(
        '/inscripciones',
        undefined,
        { params: { eventoId } },
    );
    if (
        !data ||
        typeof data.mensaje !== 'string' ||
        typeof data.inscripcionId !== 'number' ||
        typeof data.codigoQr !== 'string'
    ) {
        throw new Error('La respuesta de inscripción no contiene una entrada válida.');
    }

    return data;
};

export const listarMisInscripciones = async (): Promise<Inscripcion[]> => {
    const { data } = await axiosClient.get<Inscripcion[]>('/inscripciones/mias');
    if (
        !Array.isArray(data) ||
        data.some(
            (inscripcion) =>
                !inscripcion ||
                typeof inscripcion.id !== 'number' ||
                typeof inscripcion.eventoId !== 'number' ||
                !['ACTIVA', 'CANCELADA'].includes(inscripcion.estado) ||
                !(inscripcion.codigoQr === null || typeof inscripcion.codigoQr === 'string') ||
                typeof inscripcion.fechaInscripcion !== 'string' ||
                typeof inscripcion.eventoTitulo !== 'string' ||
                typeof inscripcion.eventoFechaInicio !== 'string' ||
                typeof inscripcion.eventoUbicacion !== 'string',
        )
    ) {
        throw new Error('La respuesta de /inscripciones/mias no es una lista válida.');
    }
    return data;
};

export const obtenerInscripcionActiva = async (eventoId: number): Promise<Inscripcion | null> => {
    const inscripciones = await listarMisInscripciones();
    return inscripciones.find(
        (inscripcion) => inscripcion.eventoId === eventoId && inscripcion.estado === 'ACTIVA',
    ) ?? null;
};

export const cancelarInscripcion = async (
    inscripcionId: number,
): Promise<RespuestaCancelacionInscripcion> => {
    const { data } = await axiosClient.delete<RespuestaCancelacionInscripcion>(
        `/inscripciones/${inscripcionId}`,
    );
    if (
        !data ||
        typeof data.mensaje !== 'string' ||
        typeof data.inscripcionId !== 'number'
    ) {
        throw new Error('La respuesta de cancelación de inscripción no es válida.');
    }

    return data;
};
