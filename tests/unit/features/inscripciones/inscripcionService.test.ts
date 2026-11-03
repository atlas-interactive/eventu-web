import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axiosClient } from '../../../../src/api';
import {
    inscribirEnEvento,
    tieneInscripcionActiva,
    listarMisInscripciones,
    cancelarInscripcion,
} from '../../../../src/features/inscripciones/services/inscripcionService';

vi.mock('../../../../src/api', () => ({
    axiosClient: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

const postMock = vi.mocked(axiosClient.post);
const getMock = vi.mocked(axiosClient.get);
const deleteMock = vi.mocked(axiosClient.delete);

describe('inscripcionService', () => {
    beforeEach(() => {
        postMock.mockReset();
        getMock.mockReset();
        deleteMock.mockReset();
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

    it('lista y valida las inscripciones sin exponer códigos QR en la pantalla', async () => {
        const inscripciones = [
            {
                id: 8,
                estado: 'ACTIVA',
                codigoQr: 'NO-RENDERIZAR',
                fechaInscripcion: '2026-03-01T10:00:00',
                eventoId: 5,
                eventoTitulo: 'Festival universitario',
                eventoFechaInicio: '2026-04-02T09:00:00',
                eventoUbicacion: 'Campus',
            },
        ];
        getMock.mockResolvedValue({ data: inscripciones });

        await expect(listarMisInscripciones()).resolves.toEqual(inscripciones);
        expect(getMock).toHaveBeenCalledWith('/inscripciones/mias');
    });

    it('cancela una inscripción por su identificador y valida la respuesta', async () => {
        const respuesta = {
            mensaje: 'Inscripción cancelada exitosamente.',
            inscripcionId: 8,
        };
        deleteMock.mockResolvedValue({ data: respuesta });

        await expect(cancelarInscripcion(8)).resolves.toEqual(respuesta);
        expect(deleteMock).toHaveBeenCalledWith('/inscripciones/8');
    });

    it('rechaza una respuesta inválida al cancelar una inscripción', async () => {
        deleteMock.mockResolvedValue({ data: { mensaje: 'Cancelada' } });

        await expect(cancelarInscripcion(8)).rejects.toThrow(
            'La respuesta de cancelación de inscripción no es válida.',
        );
    });
});
