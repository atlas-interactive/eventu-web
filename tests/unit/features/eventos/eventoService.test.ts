import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axiosClient } from '../../../../src/api';
import { crearEvento, editarEvento, listarEventos } from '../../../../src/features/eventos/services/eventoService';

vi.mock('../../../../src/api', () => ({
    axiosClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));

const clienteMock = vi.mocked(axiosClient);

describe('eventoService', () => {
    beforeEach(() => {
        clienteMock.get.mockReset();
        clienteMock.post.mockReset();
        clienteMock.put.mockReset();
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
});
