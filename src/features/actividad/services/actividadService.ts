import { axiosClient } from '../../../api';
import type {
    FiltrosActividad,
    OpcionesFiltroActividad,
    PaginaActividad,
    RegistroActividadItem,
} from '../../../types/actividad';

export const TAMANO_PAGINA_ACTIVIDAD = 20;

const esCadenaONull = (valor: unknown): valor is string | null => valor === null || typeof valor === 'string';

const esRegistroActividad = (valor: unknown): valor is RegistroActividadItem => {
    if (!valor || typeof valor !== 'object') return false;
    const registro = valor as Record<string, unknown>;
    return (
        typeof registro.id === 'number' &&
        typeof registro.fecha === 'string' &&
        esCadenaONull(registro.usuarioNombre) &&
        esCadenaONull(registro.usuarioCorreo) &&
        typeof registro.accion === 'string' &&
        typeof registro.entidad === 'string' &&
        (typeof registro.entidadId === 'number' || registro.entidadId === null) &&
        typeof registro.resultado === 'string' &&
        esCadenaONull(registro.motivo)
    );
};

const esListaDeCadenas = (valor: unknown): valor is string[] =>
    Array.isArray(valor) && valor.every((elemento) => typeof elemento === 'string');

const esObjeto = (valor: unknown): valor is Record<string, unknown> =>
    Boolean(valor) && typeof valor === 'object' && !Array.isArray(valor);

const esOpcionesFiltro = (valor: unknown): valor is OpcionesFiltroActividad =>
    esObjeto(valor) &&
    esListaDeCadenas(valor.acciones) &&
    esListaDeCadenas(valor.entidades) &&
    esListaDeCadenas(valor.resultados);

const esPaginaActividad = (valor: unknown): valor is PaginaActividad =>
    esObjeto(valor) &&
    Array.isArray(valor.contenido) &&
    valor.contenido.every(esRegistroActividad) &&
    typeof valor.pagina === 'number' &&
    typeof valor.tamano === 'number' &&
    typeof valor.totalElementos === 'number' &&
    typeof valor.totalPaginas === 'number';

export const obtenerOpcionesActividad = async (): Promise<OpcionesFiltroActividad> => {
    const url = '/logs/opciones';
    const { data } = await axiosClient.get<unknown>(url);
    if (!esOpcionesFiltro(data)) {
        throw new Error(`La respuesta de ${url} no contiene opciones de filtro válidas.`);
    }

    return data;
};

export const obtenerActividad = async (
    filtros: FiltrosActividad,
    pagina: number,
    signal?: AbortSignal,
): Promise<PaginaActividad> => {
    const url = '/logs';
    const params = Object.fromEntries(
        Object.entries({
            accion: filtros.accion.trim(),
            entidad: filtros.entidad.trim(),
            resultado: filtros.resultado.trim(),
            usuario: filtros.usuario.trim(),
            fechaDesde: filtros.fechaDesde,
            fechaHasta: filtros.fechaHasta,
            pagina,
            tamano: TAMANO_PAGINA_ACTIVIDAD,
        }).filter(([, valor]) => valor !== ''),
    );
    const { data } = await axiosClient.get<unknown>(url, { params, signal });

    if (!esPaginaActividad(data)) {
        throw new Error(`La respuesta de ${url} no es una página válida.`);
    }

    return data;
};
