import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axiosClient } from '../../../../src/api';
import { inscribirEnEvento } from '../../../../src/features/inscripciones/services/inscripcionService';

vi.mock('../../../../src/api', () => ({
    axiosClient: { post: vi.fn() },
}));

const postMock = vi.mocked(axiosClient.post);

describe('inscripcionService', () => {
    beforeEach(() => postMock.mockReset());

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
});
