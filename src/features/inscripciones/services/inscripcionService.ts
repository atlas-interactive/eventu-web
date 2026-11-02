import { axiosClient } from '../../../api';
import type { Inscripcion } from '../../../types/inscripcion';

interface InscripcionDelUsuario {
    eventoId: number;
    estado: string;
}

export interface RespuestaInscripcion {
    mensaje: string;
    inscripcionId: number;
    codigoQr: string;
}

export const inscribirEnEvento = async (eventoId: number): Promise<RespuestaInscripcion> =>
    (await axiosClient.post<RespuestaInscripcion>('/inscripciones', undefined, { params: { eventoId } })).data;

export const tieneInscripcionActiva = async (eventoId: number): Promise<boolean> => {
    const { data } = await axiosClient.get<InscripcionDelUsuario[]>('/inscripciones/mias');
    if (
        !Array.isArray(data) ||
        data.some(
            (inscripcion) =>
                !inscripcion ||
                typeof inscripcion.eventoId !== 'number' ||
                typeof inscripcion.estado !== 'string',
        )
    ) {
        throw new Error('La respuesta de /inscripciones/mias no es una lista válida.');
    }

    return data.some(
        (inscripcion) =>
            inscripcion.eventoId === eventoId && inscripcion.estado.toUpperCase() === 'ACTIVA',
    );
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
                typeof inscripcion.eventoTitulo !== 'string' ||
                typeof inscripcion.eventoFechaInicio !== 'string' ||
                typeof inscripcion.eventoUbicacion !== 'string',
        )
    ) {
        throw new Error('La respuesta de /inscripciones/mias no es una lista válida.');
    }

    return data;
};
