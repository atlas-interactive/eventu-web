import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LayoutAplicacion } from '../../../../src/components/layout/LayoutAplicacion';
import { Perfil } from '../../../../src/features/perfil/Perfil';
import {
    actualizarPerfil,
    cambiarContrasena,
    desactivarCuenta,
    obtenerPerfil,
} from '../../../../src/features/perfil/services/perfilService';
import { guardarSesion } from '../../../../src/features/sesion/sesion';
import type { PerfilUsuario } from '../../../../src/types/perfil';

vi.mock('../../../../src/features/perfil/services/perfilService', () => ({
    actualizarPerfil: vi.fn(),
    cambiarContrasena: vi.fn(),
    desactivarCuenta: vi.fn(),
    obtenerPerfil: vi.fn(),
}));

const perfil: PerfilUsuario = {
    id: 1,
    nombre: 'Laura Gomez',
    correo: 'laura.gomez@unillanos.edu.co',
    rol: 'USUARIO',
    codigoInstitucional: '16001234',
    creadoEn: '2025-03-15T10:00:00',
};

const renderizar = () =>
    render(
        <MemoryRouter initialEntries={['/perfil']}>
            <Routes>
                <Route element={<LayoutAplicacion />}>
                    <Route path="/perfil" element={<Perfil />} />
                </Route>
                <Route path="/login" element={<p>Inicio de sesión</p>} />
            </Routes>
        </MemoryRouter>,
    );

describe('Perfil', () => {
    beforeEach(() => {
        localStorage.clear();
        obtenerPerfilMock.mockReset();
        actualizarPerfilMock.mockReset();
        cambiarContrasenaMock.mockReset();
        desactivarCuentaMock.mockReset();
        obtenerPerfilMock.mockResolvedValue(perfil);
        guardarSesion({
            token: 'token-de-prueba',
            usuarioId: perfil.id,
            nombre: perfil.nombre,
            correo: perfil.correo,
            rol: perfil.rol,
        });
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('consulta y presenta los datos del perfil sin mostrar el código institucional', async () => {
        renderizar();

        expect(await screen.findByRole('heading', { name: 'Mi perfil' })).toBeInTheDocument();
        expect(screen.getByText('laura.gomez@unillanos.edu.co')).toBeInTheDocument();
        expect(screen.getByText('Usuario')).toBeInTheDocument();
        expect(screen.getByText('Miembro desde')).toBeInTheDocument();
        expect(screen.queryByText('16001234')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Desactivar mi cuenta' })).toBeEnabled();
        expect(screen.getByRole('button', { name: 'Actualizar contraseña' })).toBeEnabled();
        expect(document.querySelectorAll('.perfil-card')).toHaveLength(3);
        expect(document.querySelectorAll('.perfil-card-accent')).toHaveLength(3);
    });

    it('actualiza el nombre conservando el código institucional y sincroniza la sesión visible', async () => {
        const actualizado = { ...perfil, nombre: 'Laura Gomez Ruiz' };
        actualizarPerfilMock.mockResolvedValue(actualizado);
        const user = userEvent.setup();
        renderizar();

        await user.click(await screen.findByRole('button', { name: 'Editar información' }));
        const nombre = screen.getByRole('textbox', { name: 'Nombre completo' });
        await user.clear(nombre);
        await user.type(nombre, '  Laura Gomez Ruiz  ');
        await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

        expect(actualizarPerfilMock).toHaveBeenCalledWith({
            nombre: 'Laura Gomez Ruiz',
            codigoInstitucional: '16001234',
        });
        expect(await screen.findByRole('status')).toHaveTextContent('Tu información se actualizó correctamente.');
        expect(JSON.parse(localStorage.getItem('auth_usuario') ?? '{}').nombre).toBe('Laura Gomez Ruiz');
        expect(localStorage.getItem('auth_token')).toBe('token-de-prueba');
        expect(screen.getByRole('button', { name: 'Menú de perfil de Laura Gomez' })).toBeInTheDocument();
    });

    it('permite cancelar la edición sin modificar el perfil', async () => {
        const user = userEvent.setup();
        renderizar();

        await user.click(await screen.findByRole('button', { name: 'Editar información' }));
        const nombre = screen.getByRole('textbox', { name: 'Nombre completo' });
        await user.clear(nombre);
        await user.type(nombre, 'Otro nombre');
        await user.click(screen.getByRole('button', { name: 'Cancelar' }));

        expect(screen.getByRole('heading', { name: 'Laura Gomez' })).toBeInTheDocument();
        expect(actualizarPerfilMock).not.toHaveBeenCalled();
    });

    it('muestra errores al fallar la consulta de perfil y permite reintentar', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        obtenerPerfilMock.mockRejectedValueOnce(new Error('Error de prueba')).mockResolvedValueOnce(perfil);
        const user = userEvent.setup();
        renderizar();

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Ocurrió un error inesperado al conectar con el servidor.',
        );
        await user.click(screen.getByRole('button', { name: 'Reintentar' }));
        expect(await screen.findByRole('heading', { name: 'Laura Gomez' })).toBeInTheDocument();
    });

    it('cambia la contraseña, guarda el token renovado y conserva la sesión', async () => {
        cambiarContrasenaMock.mockResolvedValue({
            mensaje: 'Contraseña actualizada exitosamente.',
            token: 'token-renovado',
        });
        const user = userEvent.setup();
        renderizar();

        await screen.findByRole('heading', { name: 'Laura Gomez' });
        await user.type(screen.getByLabelText('Contraseña actual'), 'clave-anterior');
        await user.type(screen.getByLabelText('Nueva contraseña'), 'clave-nueva-123');
        await user.type(screen.getByLabelText('Confirmar nueva contraseña'), 'clave-nueva-123');
        await user.click(screen.getByRole('button', { name: 'Actualizar contraseña' }));

        expect(cambiarContrasenaMock).toHaveBeenCalledWith({
            passwordActual: 'clave-anterior',
            passwordNueva: 'clave-nueva-123',
        });
        expect(await screen.findByRole('status')).toHaveTextContent('Contraseña actualizada exitosamente.');
        expect(localStorage.getItem('auth_token')).toBe('token-renovado');
        expect(JSON.parse(localStorage.getItem('auth_usuario') ?? '{}')).toMatchObject({
            nombre: 'Laura Gomez',
            correo: perfil.correo,
        });
        expect(screen.getByLabelText('Contraseña actual')).toHaveValue('');
        expect(screen.getByLabelText('Nueva contraseña')).toHaveValue('');
        expect(screen.getByLabelText('Confirmar nueva contraseña')).toHaveValue('');
    });

    it('valida la longitud y confirmación de contraseña antes de llamar al servicio', async () => {
        const user = userEvent.setup();
        renderizar();

        await screen.findByRole('heading', { name: 'Laura Gomez' });
        await user.type(screen.getByLabelText('Contraseña actual'), 'clave-anterior');
        await user.type(screen.getByLabelText('Nueva contraseña'), 'clave-nueva-123');
        await user.type(screen.getByLabelText('Confirmar nueva contraseña'), 'no-coincide');
        await user.click(screen.getByRole('button', { name: 'Actualizar contraseña' }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'La confirmación no coincide con la nueva contraseña.',
        );
        expect(cambiarContrasenaMock).not.toHaveBeenCalled();
        expect(localStorage.getItem('auth_token')).toBe('token-de-prueba');
    });

    it('muestra el error del cambio de contraseña sin cerrar la sesión', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        cambiarContrasenaMock.mockRejectedValue(new Error('Error de prueba'));
        const user = userEvent.setup();
        renderizar();

        await screen.findByRole('heading', { name: 'Laura Gomez' });
        await user.type(screen.getByLabelText('Contraseña actual'), 'incorrecta');
        await user.type(screen.getByLabelText('Nueva contraseña'), 'clave-nueva-123');
        await user.type(screen.getByLabelText('Confirmar nueva contraseña'), 'clave-nueva-123');
        await user.click(screen.getByRole('button', { name: 'Actualizar contraseña' }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Ocurrió un error inesperado al conectar con el servidor.',
        );
        expect(localStorage.getItem('auth_token')).toBe('token-de-prueba');
        expect(localStorage.getItem('auth_usuario')).not.toBeNull();
    });

    it('permite cancelar la desactivación sin enviar la contraseña', async () => {
        const user = userEvent.setup();
        renderizar();

        await user.click(await screen.findByRole('button', { name: 'Desactivar mi cuenta' }));
        const dialogo = screen.getByRole('dialog');
        expect(dialogo).toHaveTextContent('Confirmar desactivación de cuenta');
        await user.type(within(dialogo).getByLabelText('Contraseña actual'), 'clave-actual');
        await user.click(screen.getByRole('button', { name: 'Volver' }));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(desactivarCuentaMock).not.toHaveBeenCalled();
        expect(localStorage.getItem('auth_token')).toBe('token-de-prueba');
    });

    it('desactiva la cuenta, limpia la sesión local y redirige al inicio de sesión', async () => {
        desactivarCuentaMock.mockResolvedValue({
            mensaje: 'La cuenta se desactivó correctamente.',
        });
        const user = userEvent.setup();
        renderizar();

        await user.click(await screen.findByRole('button', { name: 'Desactivar mi cuenta' }));
        await user.type(within(screen.getByRole('dialog')).getByLabelText('Contraseña actual'), 'clave-actual');
        await user.click(screen.getByRole('button', { name: 'Confirmar desactivación' }));

        expect(desactivarCuentaMock).toHaveBeenCalledWith('clave-actual');
        expect(await screen.findByText('Inicio de sesión')).toBeInTheDocument();
        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(localStorage.getItem('auth_usuario')).toBeNull();
    });

    it('muestra errores del servidor y conserva la sesión cuando no se permite desactivar', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        desactivarCuentaMock.mockRejectedValue(
            Object.assign(new Error('Conflicto'), {
                isAxiosError: true,
                response: { data: { error: 'No puedes desactivar la cuenta mientras seas el único administrador.' } },
            }),
        );
        const user = userEvent.setup();
        renderizar();

        await user.click(await screen.findByRole('button', { name: 'Desactivar mi cuenta' }));
        await user.type(within(screen.getByRole('dialog')).getByLabelText('Contraseña actual'), 'clave-actual');
        await user.click(screen.getByRole('button', { name: 'Confirmar desactivación' }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'No puedes desactivar la cuenta mientras seas el único administrador.',
        );
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(localStorage.getItem('auth_token')).toBe('token-de-prueba');
        expect(within(screen.getByRole('dialog')).getByLabelText('Contraseña actual')).toHaveValue('');
    });
});

const obtenerPerfilMock = vi.mocked(obtenerPerfil);
const actualizarPerfilMock = vi.mocked(actualizarPerfil);
const cambiarContrasenaMock = vi.mocked(cambiarContrasena);
const desactivarCuentaMock = vi.mocked(desactivarCuenta);
