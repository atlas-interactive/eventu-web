import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axiosClient } from '../../../../src/api';
import { cambiarContrasena } from '../../../../src/features/perfil/services/perfilService';

vi.mock('../../../../src/api', () => ({
    axiosClient: { get: vi.fn(), put: vi.fn() },
}));

const clienteMock = vi.mocked(axiosClient);

describe('perfilService', () => {
    beforeEach(() => {
        clienteMock.get.mockReset();
        clienteMock.put.mockReset();
    });

    it('envía las credenciales de cambio y devuelve el mensaje y token renovado', async () => {
        const respuesta = {
            mensaje: 'Contraseña actualizada exitosamente.',
            token: 'token-renovado',
        };
        clienteMock.put.mockResolvedValue({ data: respuesta });

        await expect(
            cambiarContrasena({
                passwordActual: 'clave-anterior',
                passwordNueva: 'clave-nueva-123',
            }),
        ).resolves.toEqual(respuesta);
        expect(clienteMock.put).toHaveBeenCalledWith('/perfil/contrasena', {
            passwordActual: 'clave-anterior',
            passwordNueva: 'clave-nueva-123',
        });
    });

    it('rechaza una respuesta exitosa que no incluya un token renovado', async () => {
        clienteMock.put.mockResolvedValue({ data: { mensaje: 'Cambio completado.' } });

        await expect(
            cambiarContrasena({
                passwordActual: 'clave-anterior',
                passwordNueva: 'clave-nueva-123',
            }),
        ).rejects.toThrow('El servidor no devolvió un token válido');
    });
});
