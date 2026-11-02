import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axiosClient } from '../../../../src/api';
import {
    inscribirEnEvento,
    tieneInscripcionActiva,
} from '../../../../src/features/inscripciones/services/inscripcionService';

vi.mock('../../../../src/api', () => ({
    axiosClient: { get: vi.fn(), post: vi.fn() },
}));

const postMock = vi.mocked(axiosClient.post);
const getMock = vi.mocked(axiosClient.get);

describe('inscripcionService', () => {
    beforeEach(() => {
        postMock.mockReset();
        getMock.mockReset();
    });

    it('envía el id del evento como parámetro y devuelve la respuesta del backend', async () => {
        const respuesta = {
            mensaje: 'Inscripción realizada exitosamente.',
            inscripcionId: 12,
            codigoQr: 'EVENTU-QR-SECRETO',
        };
        postMock.mockResolvedValue({ data: respuesta });

        await expect(inscribirEnEvento(5)).resolves.toEqual(respuesta);

        expect(postMock).toHaveBeenCalledWith('/inscripciones', undefined, { params: { eventoId: 5 } });
    });

    it('detecta una inscripción activa del evento sin usar otros datos de la respuesta', async () => {
        getMock.mockResolvedValue({
            data: [
                { eventoId: 4, estado: 'ACTIVA', codigoQr: 'NO-USAR-QR' },
                { eventoId: 5, estado: 'ACTIVA', codigoQr: 'NO-USAR-QR' },
            ],
        });

        await expect(tieneInscripcionActiva(5)).resolves.toBe(true);

        expect(getMock).toHaveBeenCalledWith('/inscripciones/mias');
    });

    it('ignora inscripciones canceladas y eventos distintos', async () => {
        getMock.mockResolvedValue({
            data: [
                { eventoId: 5, estado: 'CANCELADA' },
                { eventoId: 7, estado: 'ACTIVA' },
            ],
        });

        await expect(tieneInscripcionActiva(5)).resolves.toBe(false);
    });

    it('rechaza una respuesta inválida del endpoint de inscripciones', async () => {
        getMock.mockResolvedValue({ data: { eventoId: 5, estado: 'ACTIVA' } });

        await expect(tieneInscripcionActiva(5)).rejects.toThrow(
            'La respuesta de /inscripciones/mias no es una lista válida.',
        );
    });
});
