import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axiosClient } from '../../../../src/api';
import {
    asignarOrganizador,
    buscarUsuarios,
    listarOrganizadores,
    revocarOrganizador,
} from '../../../../src/features/usuarios/services/usuarioService';

vi.mock('../../../../src/api', () => ({
    axiosClient: { get: vi.fn(), put: vi.fn() },
}));

const clienteMock = vi.mocked(axiosClient);

describe('usuarioService', () => {
    beforeEach(() => {
        clienteMock.get.mockReset();
        clienteMock.put.mockReset();
    });

    it('busca por criterio', async () => {
        clienteMock.get.mockResolvedValue({ data: [{ id: 1 }] });

        const resultado = await buscarUsuarios('laura');

        expect(clienteMock.get).toHaveBeenCalledWith('/usuarios', { params: { criterio: 'laura' } });
        expect(resultado).toEqual([{ id: 1 }]);
    });

    it('rechaza una respuesta que no es una lista', async () => {
        clienteMock.get.mockResolvedValue({ data: '<!doctype html>' });

        await expect(buscarUsuarios('laura')).rejects.toThrow('no es una lista');
    });

    it('asigna el rol por id, sin cuerpo (el administrador va en el token)', async () => {
        clienteMock.put.mockResolvedValue({ data: { mensaje: 'ok', usuarioId: 4, rol: 'ORGANIZADOR' } });

        const resultado = await asignarOrganizador(4);

        expect(clienteMock.put).toHaveBeenCalledWith('/usuarios/4/asignar-organizador');
        expect(resultado.rol).toBe('ORGANIZADOR');
    });

    it('revoca el rol por id, sin cuerpo', async () => {
        clienteMock.put.mockResolvedValue({ data: { mensaje: 'ok', usuarioId: 4, rol: 'USUARIO' } });

        await revocarOrganizador(4);

        expect(clienteMock.put).toHaveBeenCalledWith('/usuarios/4/revocar-organizador');
    });

    it('lista los organizadores actuales', async () => {
        clienteMock.get.mockResolvedValue({ data: [{ id: 5 }] });

        const resultado = await listarOrganizadores();

        expect(clienteMock.get).toHaveBeenCalledWith('/usuarios/organizadores');
        expect(resultado).toEqual([{ id: 5 }]);
    });

    it('rechaza una lista de organizadores que no es una lista', async () => {
        clienteMock.get.mockResolvedValue({ data: '<!doctype html>' });

        await expect(listarOrganizadores()).rejects.toThrow('no es una lista');
    });
});
