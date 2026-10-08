import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axiosClient } from '../../../../src/api';
import {
    activarCategoria,
    crearCategoria,
    desactivarCategoria,
    editarCategoria,
    listarCategorias,
} from '../../../../src/features/categorias/services/categoriaService';

vi.mock('../../../../src/api', () => ({
    axiosClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn() },
}));

const clienteMock = vi.mocked(axiosClient);

describe('categoriaService', () => {
    beforeEach(() => {
        clienteMock.get.mockReset();
        clienteMock.post.mockReset();
        clienteMock.put.mockReset();
        clienteMock.patch.mockReset();
    });

    it('lista todas las categorías por defecto', async () => {
        clienteMock.get.mockResolvedValue({ data: [{ id: 1 }] });

        const resultado = await listarCategorias();

        expect(clienteMock.get).toHaveBeenCalledWith('/categorias', { params: { soloActivas: false } });
        expect(resultado).toEqual([{ id: 1 }]);
    });

    it('rechaza una respuesta que no es una lista (por ejemplo, HTML por una URL mal configurada)', async () => {
        clienteMock.get.mockResolvedValue({ data: '<!doctype html><html></html>' });

        await expect(listarCategorias()).rejects.toThrow('no es una lista');
    });

    it('pide solo las activas para el selector de eventos', async () => {
        clienteMock.get.mockResolvedValue({ data: [] });

        await listarCategorias(true);

        expect(clienteMock.get).toHaveBeenCalledWith('/categorias', { params: { soloActivas: true } });
    });

    it('crea sin enviar el id del administrador (va en el token)', async () => {
        clienteMock.post.mockResolvedValue({ data: { id: 9, nombre: 'Arte' } });

        const resultado = await crearCategoria({ nombre: 'Arte' });

        expect(clienteMock.post).toHaveBeenCalledWith('/categorias', { nombre: 'Arte' });
        expect(resultado.id).toBe(9);
    });

    it('edita el nombre por id', async () => {
        clienteMock.put.mockResolvedValue({ data: { id: 5, nombre: 'Arte' } });

        await editarCategoria(5, { nombre: 'Arte' });

        expect(clienteMock.put).toHaveBeenCalledWith('/categorias/5', { nombre: 'Arte' });
    });

    it('desactiva solo con el id, sin cuerpo', async () => {
        clienteMock.patch.mockResolvedValue({ data: { id: 5, activo: false } });

        const resultado = await desactivarCategoria(5);

        expect(clienteMock.patch).toHaveBeenCalledWith('/categorias/5/desactivar');
        expect(resultado.activo).toBe(false);
    });

    it('activa solo con el id, sin cuerpo', async () => {
        clienteMock.patch.mockResolvedValue({ data: { id: 5, activo: true } });

        await activarCategoria(5);

        expect(clienteMock.patch).toHaveBeenCalledWith('/categorias/5/activar');
    });
});