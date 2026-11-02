import { axiosClient } from '../../../api';

export interface RespuestaInscripcion {
    mensaje: string;
    inscripcionId: number;
    codigoQr: string;
}

interface InscripcionDelUsuario {
    eventoId: number;
    estado: string;
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
