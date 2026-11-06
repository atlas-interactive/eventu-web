import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axiosClient } from '../../../../src/api';
import { cambiarContrasena, desactivarCuenta } from '../../../../src/features/perfil/services/perfilService';

vi.mock('../../../../src/api', () => ({
    axiosClient: { get: vi.fn(), put: vi.fn(), patch: vi.fn() },
}));

const clienteMock = vi.mocked(axiosClient);

describe('perfilService', () => {
    beforeEach(() => {
        clienteMock.get.mockReset();
        clienteMock.put.mockReset();
        clienteMock.patch.mockReset();
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

    it('envía la contraseña actual al endpoint de desactivación y devuelve su mensaje', async () => {
        const respuesta = { mensaje: 'La cuenta se desactivó correctamente.' };
        clienteMock.patch.mockResolvedValue({ data: respuesta });

        await expect(desactivarCuenta('clave-actual')).resolves.toEqual(respuesta);
        expect(clienteMock.patch).toHaveBeenCalledWith('/perfil/desactivar', {
            password: 'clave-actual',
        });
    });

    it('rechaza una respuesta de desactivación sin mensaje', async () => {
        clienteMock.patch.mockResolvedValue({ data: {} });

        await expect(desactivarCuenta('clave-actual')).rejects.toThrow(
            'El servidor no devolvió un mensaje válido',
        );
    });
});
