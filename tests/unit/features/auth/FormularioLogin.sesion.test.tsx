import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FormularioLogin } from '../../../../src/features/auth/FormularioLogin';
import { autenticarUsuario } from '../../../../src/features/auth/services/authService';
import { obtenerSesion } from '../../../../src/features/sesion/sesion';

vi.mock('../../../../src/features/auth/services/authService', () => ({
    autenticarUsuario: vi.fn(),
}));

const autenticarMock = vi.mocked(autenticarUsuario);

const renderizar = () =>
    render(
        <MemoryRouter initialEntries={['/login']}>
            <Routes>
                <Route path="/login" element={<FormularioLogin />} />
                <Route path="/admin/categorias" element={<p>Pantalla de categorías</p>} />
            </Routes>
        </MemoryRouter>,
    );

const iniciarSesion = async () => {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Correo institucional'), 'admin@unillanos.edu.co');
    await user.type(screen.getByLabelText('Contraseña'), 'password-segura');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
};

describe('FormularioLogin: sesión y redirección', () => {
    beforeEach(() => {
        localStorage.clear();
        autenticarMock.mockReset();
    });
    afterEach(cleanup);

    it('guarda la sesión y lleva al administrador a la gestión de categorías', async () => {
        autenticarMock.mockResolvedValue({
            token: 'jwt-de-prueba',
            usuarioId: 1n,
            nombre: 'Admin',
            correo: 'admin@unillanos.edu.co',
            rol: 'ADMIN',
        });
        renderizar();

        await iniciarSesion();

        expect(await screen.findByText('Pantalla de categorías')).toBeInTheDocument();
        expect(localStorage.getItem('auth_token')).toBe('jwt-de-prueba');
        expect(obtenerSesion()).toEqual({
            usuarioId: 1,
            nombre: 'Admin',
            correo: 'admin@unillanos.edu.co',
            rol: 'ADMIN',
        });
    });

    it('guarda la sesión de un usuario normal pero no lo lleva al panel de administración', async () => {
        autenticarMock.mockResolvedValue({
            token: 'jwt-de-prueba',
            usuarioId: 2n,
            nombre: 'Ana',
            correo: 'ana@unillanos.edu.co',
            rol: 'USUARIO',
        });
        renderizar();

        await iniciarSesion();

        expect(await screen.findByRole('status')).toHaveTextContent(
            'Sesión iniciada, Ana. El listado de eventos estará disponible en la próxima versión.',
        );
        expect(screen.queryByText('Pantalla de categorías')).not.toBeInTheDocument();
        expect(obtenerSesion()?.rol).toBe('USUARIO');
    });
});