import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axiosClient } from '../../../../src/api';
import {
    cancelarEvento,
    crearEvento,
    descargarReporteEvento,
    editarEvento,
    listarEventos,
} from '../../../../src/features/eventos/services/eventoService';

vi.mock('../../../../src/api', () => ({
    axiosClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn() },
}));

const clienteMock = vi.mocked(axiosClient);

describe('eventoService', () => {
    beforeEach(() => {
        clienteMock.get.mockReset();
        clienteMock.post.mockReset();
        clienteMock.put.mockReset();
        clienteMock.patch.mockReset();
    });

    it('lista los eventos publicados', async () => {
        clienteMock.get.mockResolvedValue({ data: [{ id: 1 }] });

        const resultado = await listarEventos();

        expect(clienteMock.get).toHaveBeenCalledWith('/eventos');
        expect(resultado).toEqual([{ id: 1 }]);
    });

    it('rechaza una respuesta que no es una lista', async () => {
        clienteMock.get.mockResolvedValue({ data: '<!doctype html>' });

        await expect(listarEventos()).rejects.toThrow('no es una lista');
    });

    it('crea el evento sin enviar el id del organizador (va en el token)', async () => {
        clienteMock.post.mockResolvedValue({ data: { mensaje: 'Evento creado exitosamente.', eventoId: 7 } });
        const solicitud = {
            titulo: 'Feria',
            descripcion: 'Descripción',
            fechaInicio: '2026-10-20T14:30',
            ubicacion: 'Auditorio',
            cuposMaximos: 50,
            categoriaId: 2,
        };

        const resultado = await crearEvento(solicitud);

        expect(clienteMock.post).toHaveBeenCalledWith('/eventos', solicitud);
        expect(resultado.eventoId).toBe(7);
    });

    it('edita por id enviando solo los campos recibidos', async () => {
        clienteMock.put.mockResolvedValue({ data: { mensaje: 'Evento actualizado exitosamente.', eventoId: 7 } });

        await editarEvento(7, { cuposMaximos: 80 });

        expect(clienteMock.put).toHaveBeenCalledWith('/eventos/7', { cuposMaximos: 80 });
    });

    it('cancela el evento por id sin enviar un cuerpo', async () => {
        clienteMock.patch.mockResolvedValue({ data: { mensaje: 'Evento cancelado correctamente.', eventoId: 7 } });

        const resultado = await cancelarEvento(7);

        expect(clienteMock.patch).toHaveBeenCalledWith('/eventos/7/cancelar');
        expect(resultado.mensaje).toBe('Evento cancelado correctamente.');
    });

    it('descarga el reporte del evento como Blob', async () => {
        const pdf = new Blob(['%PDF-1.7'], { type: 'application/pdf' });
        clienteMock.get.mockResolvedValue({ data: pdf });

        const resultado = await descargarReporteEvento(7);

        expect(clienteMock.get).toHaveBeenCalledWith('/eventos/7/reporte', { responseType: 'blob' });
        expect(resultado).toBe(pdf);
    });

    it('convierte a JSON el error que llega como Blob para conservar el mensaje del backend', async () => {
        const cuerpo = new Blob([JSON.stringify({ error: 'No tienes permiso sobre este evento.' })], { type: 'application/json' });
        clienteMock.get.mockRejectedValue({ isAxiosError: true, response: { status: 403, data: cuerpo } });

        await expect(descargarReporteEvento(7)).rejects.toMatchObject({
            response: { data: { error: 'No tienes permiso sobre este evento.' } },
        });
    });
});
