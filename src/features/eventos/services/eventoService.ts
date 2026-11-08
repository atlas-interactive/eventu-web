import { axiosClient } from '../../../api';
import { convertirErrorBlob } from '../../../api/descargas';
import type {
    Evento,
    EventoActualizacion,
    EventoSolicitud,
    FiltrosEvento,
    InscritoEvento,
    RespuestaEvento,
} from '../../../types/evento';

// El organizador se identifica con el token JWT (el interceptor de axios lo envía), por eso ninguna llamada lleva su id

const obtenerParametros = (filtros: FiltrosEvento) =>
    Object.fromEntries(
        Object.entries(filtros)
            .map(([clave, valor]) => [clave, typeof valor === 'string' ? valor.trim() : valor])
            .filter(([clave, valor]) => clave !== 'estado' && valor !== undefined && valor !== ''),
    );

const consultarEventos = async (url: string, filtros: FiltrosEvento): Promise<Evento[]> => {
    const params = obtenerParametros(filtros);
    const { data } = Object.keys(params).length > 0
        ? await axiosClient.get<Evento[]>(url, { params })
        : await axiosClient.get<Evento[]>(url);
    if (!Array.isArray(data)) {
        throw new Error(`La respuesta de ${url} no es una lista.`);
    }
    return data;
};

// El backend limita los eventos visibles según el rol del token.
export const listarEventos = (filtros: FiltrosEvento = {}): Promise<Evento[]> =>
    consultarEventos('/eventos', filtros);

// Lista solo los eventos creados por el organizador autenticado, incluidos los cancelados.
export const listarMisEventos = (filtros: FiltrosEvento = {}): Promise<Evento[]> =>
    consultarEventos('/eventos/mios', filtros);

//Para obtener los detalles de un evento específico 
export const obtenerEvento = async (id: number): Promise<Evento> => {
    const { data } = await axiosClient.get<Evento>(`/eventos/${id}`);
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('La respuesta de /eventos/{id} no es un evento válido.');
    }
    return data;
};

export const listarInscritosEvento = async (id: number): Promise<InscritoEvento[]> => {
    const url = `/eventos/${id}/inscritos`;
    const { data } = await axiosClient.get<InscritoEvento[]>(url);
    if (
        !Array.isArray(data) ||
        data.some(
            (inscrito) =>
                !inscrito ||
                typeof inscrito.inscripcionId !== 'number' ||
                typeof inscrito.usuarioId !== 'number' ||
                typeof inscrito.nombre !== 'string' ||
                typeof inscrito.correo !== 'string' ||
                typeof inscrito.fechaInscripcion !== 'string' ||
                typeof inscrito.asistio !== 'boolean',
        )
    ) {
        throw new Error(`La respuesta de ${url} no es una lista válida de inscritos.`);
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
