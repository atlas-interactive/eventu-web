import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LayoutAplicacion } from '../../../../src/components/layout/LayoutAplicacion';
import { Perfil } from '../../../../src/features/perfil/Perfil';
import { actualizarPerfil, obtenerPerfil } from '../../../../src/features/perfil/services/perfilService';
import { guardarSesion } from '../../../../src/features/sesion/sesion';
import type { PerfilUsuario } from '../../../../src/features/perfil/types/perfil';

vi.mock('../../../../src/features/perfil/services/perfilService', () => ({
    actualizarPerfil: vi.fn(),
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
            </Routes>
        </MemoryRouter>,
    );

describe('Perfil', () => {
    beforeEach(() => {
        localStorage.clear();
        obtenerPerfilMock.mockReset();
        actualizarPerfilMock.mockReset();
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
        expect(screen.getByRole('button', { name: 'Desactivar mi cuenta' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Actualizar contraseña' })).toBeDisabled();
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
});

const obtenerPerfilMock = vi.mocked(obtenerPerfil);
const actualizarPerfilMock = vi.mocked(actualizarPerfil);
