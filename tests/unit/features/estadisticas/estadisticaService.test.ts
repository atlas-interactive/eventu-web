import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axiosClient } from '../../../../src/api';
import { obtenerEstadisticas } from '../../../../src/features/estadisticas/services/estadisticaService';
import type { Estadisticas } from '../../../../src/types/estadisticas';

vi.mock('../../../../src/api', () => ({
    axiosClient: { get: vi.fn() },
}));

const getMock = vi.mocked(axiosClient.get);

describe('estadisticaService', () => {
    beforeEach(() => getMock.mockReset());

    it('consulta las estadísticas y devuelve los datos del servidor', async () => {
        const datos: Estadisticas = {
            inscripcionesActivas: 12,
            asistentes: 8,
            porcentajeAsistencia: 66.67,
            categoriasMasConcurridas: [{ categoria: 'Cultura', inscripcionesActivas: 7 }],
            eventosConMasInscritos: [{ eventoId: 3, titulo: 'Festival', inscripcionesActivas: 12 }],
        };
        getMock.mockResolvedValue({ data: datos });

        await expect(obtenerEstadisticas()).resolves.toEqual(datos);
        expect(getMock).toHaveBeenCalledWith('/estadisticas');
    });

});
