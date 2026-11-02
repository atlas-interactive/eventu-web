import { axiosClient } from '../../../api';

export interface RespuestaInscripcion {
    mensaje: string;
    inscripcionId: number;
    codigoQr: string;
}

export const inscribirEnEvento = async (eventoId: number): Promise<RespuestaInscripcion> =>
    (await axiosClient.post<RespuestaInscripcion>('/inscripciones', undefined, { params: { eventoId } })).data;
