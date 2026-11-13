import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axiosClient } from '../../../../src/api';
import {
    obtenerActividad,
    obtenerOpcionesActividad,
    TAMANO_PAGINA_ACTIVIDAD,
} from '../../../../src/features/actividad/services/actividadService';
import type { FiltrosActividad } from '../../../../src/types/actividad';

vi.mock('../../../../src/api', () => ({
    axiosClient: { get: vi.fn() },
}));

const getMock = vi.mocked(axiosClient.get);

describe('actividadService', () => {
    beforeEach(() => getMock.mockReset());

    it('consulta y valida las opciones de filtro disponibles', async () => {
        const opciones = {
            acciones: ['INICIAR_SESION'],
            entidades: ['USUARIO'],
            resultados: ['EXITOSO', 'FALLIDO'],
        };
        getMock.mockResolvedValue({ data: opciones });

        await expect(obtenerOpcionesActividad()).resolves.toEqual(opciones);
        expect(getMock).toHaveBeenCalledWith('/logs/opciones');
    });

    it('consulta una página de logs y omite filtros vacíos', async () => {
        const pagina = {
            contenido: [],
            pagina: 1,
            tamano: TAMANO_PAGINA_ACTIVIDAD,
            totalElementos: 40,
            totalPaginas: 2,
        };
        const filtros: FiltrosActividad = {
            accion: '',
            entidad: ' USUARIO ',
            resultado: '',
            usuario: ' ana ',
            fechaDesde: '',
            fechaHasta: '',
        };
        getMock.mockResolvedValue({ data: pagina });

        await expect(obtenerActividad(filtros, 1)).resolves.toEqual(pagina);
        expect(getMock).toHaveBeenCalledWith('/logs', {
            params: { entidad: 'USUARIO', usuario: 'ana', pagina: 1, tamano: 20 },
            signal: undefined,
        });
    });

    it('rechaza respuestas de página con estructura inválida', async () => {
        getMock.mockResolvedValue({ data: { contenido: [] } });

        await expect(obtenerActividad({
            accion: '',
            entidad: '',
            resultado: '',
            usuario: '',
            fechaDesde: '',
            fechaHasta: '',
        }, 0)).rejects.toThrow('La respuesta de /logs no es una página válida.');
    });
});
