import { axiosClient } from '../../../api';
import type { Evento, EventoActualizacion, EventoSolicitud, RespuestaEvento } from '../../../types/evento';

// El organizador se identifica con el token JWT (el interceptor de axios lo envía), por eso ninguna llamada lleva su id

// Devuelve los eventos publicados. El backend aún no tiene consulta por id, así que la edición busca aquí
export const listarEventos = async (): Promise<Evento[]> => {
    const { data } = await axiosClient.get<Evento[]>('/eventos');
    if (!Array.isArray(data)) {
        throw new Error('La respuesta de /eventos no es una lista.');
    }
    return data;
};

export const crearEvento = async (data: EventoSolicitud): Promise<RespuestaEvento> =>
    (await axiosClient.post<RespuestaEvento>('/eventos', data)).data;

export const editarEvento = async (id: number, data: EventoActualizacion): Promise<RespuestaEvento> =>
    (await axiosClient.put<RespuestaEvento>(`/eventos/${id}`, data)).data;
