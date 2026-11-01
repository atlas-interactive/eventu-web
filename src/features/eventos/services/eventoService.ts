import { axiosClient } from '../../../api';
import { convertirErrorBlob } from '../../../api/descargas';
import type { Evento, EventoActualizacion, EventoSolicitud, FiltrosEvento, RespuestaEvento } from '../../../types/evento';

// El organizador se identifica con el token JWT (el interceptor de axios lo envía), por eso ninguna llamada lleva su id

// El backend aplica los filtros y limita la visibilidad según el rol del token.
export const listarEventos = async (filtros: FiltrosEvento = {}): Promise<Evento[]> => {
    const params = Object.fromEntries(
        Object.entries(filtros)
            .map(([clave, valor]) => [clave, typeof valor === 'string' ? valor.trim() : valor])
            .filter(([, valor]) => valor !== undefined && valor !== ''),
    );
    const { data } = Object.keys(params).length > 0
        ? await axiosClient.get<Evento[]>('/eventos', { params })
        : await axiosClient.get<Evento[]>('/eventos');
    if (!Array.isArray(data)) {
        throw new Error('La respuesta de /eventos no es una lista.');
    }
    return data;
};

export const crearEvento = async (data: EventoSolicitud): Promise<RespuestaEvento> =>
    (await axiosClient.post<RespuestaEvento>('/eventos', data)).data;

export const editarEvento = async (id: number, data: EventoActualizacion): Promise<RespuestaEvento> =>
    (await axiosClient.put<RespuestaEvento>(`/eventos/${id}`, data)).data;

export const cancelarEvento = async (id: number): Promise<RespuestaEvento> =>
    (await axiosClient.patch<RespuestaEvento>(`/eventos/${id}/cancelar`)).data;

// PDF con los inscritos activos del evento (HU-17)
export const descargarReporteEvento = async (id: number): Promise<Blob> => {
    try {
        return (await axiosClient.get<Blob>(`/eventos/${id}/reporte`, { responseType: 'blob' })).data;
    } catch (err: unknown) {
        throw await convertirErrorBlob(err);
    }
};
