import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LayoutAplicacion } from '../../../src/components/layout/LayoutAplicacion';
import { guardarSesion } from '../../../src/features/sesion/sesion';

const renderizar = () =>
    render(
        <MemoryRouter initialEntries={['/']} >
            <Routes>
                <Route element={<LayoutAplicacion />}>
                    <Route path="/" element={<p>Contenido</p>} />
                    <Route path="/login" element={<p>Pantalla de login</p>} />
                </Route>
            </Routes>
        </MemoryRouter>,
    );

describe('LayoutAplicacion', () => {
    beforeEach(() => localStorage.clear());
    afterEach(cleanup);

    it('muestra al administrador las rutas disponibles y su nombre abreviado', () => {
        guardarSesion({
            token: 't',
            usuarioId: 1,
            nombre: 'Juan Carlos Pineda Rojas',
            correo: 'juan@unillanos.edu.co',
            rol: 'ADMIN',
        });

        renderizar();

        const navegacion = screen.getByRole('navigation', { name: 'Principal' });
        expect(navegacion).toHaveAccessibleName('Principal');
        expect(screen.getByRole('link', { name: 'Categorías' })).toHaveAttribute('href', '/admin/categorias');
        expect(screen.getByRole('link', { name: 'Organizadores' })).toHaveAttribute('href', '/admin/usuarios');
        expect(screen.getByRole('link', { name: 'Eventos' })).toHaveAttribute('href', '/organizador/eventos');
        expect(screen.getByRole('link', { name: 'Estadísticas' })).toHaveAttribute('href', '/admin/estadisticas');
        expect(screen.getByText('Juan Pineda')).toHaveAttribute('title', 'Juan Pineda');
        expect(screen.getByText('Administrador')).toBeInTheDocument();
    });

    it('limita la navegación del organizador a sus eventos y estadísticas', () => {
        guardarSesion({
            token: 't',
            usuarioId: 2,
            nombre: 'Ana Gómez',
            correo: 'ana@unillanos.edu.co',
            rol: 'ORGANIZADOR',
        });

        renderizar();

        expect(screen.getByRole('link', { name: 'Mis eventos' })).toHaveAttribute('href', '/organizador/eventos');
        expect(screen.getByRole('link', { name: 'Estadísticas' })).toHaveAttribute('href', '/organizador/estadisticas');
        expect(screen.queryByRole('link', { name: 'Categorías' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Organizadores' })).not.toBeInTheDocument();
        expect(screen.getByText('Ana Gómez')).toBeInTheDocument();
    });

    it('cierra la sesión y navega al login', async () => {
        guardarSesion({
            token: 'jwt-de-prueba',
            usuarioId: 1,
            nombre: 'Ana Gómez',
            correo: 'ana@unillanos.edu.co',
            rol: 'ORGANIZADOR',
        });
        const user = userEvent.setup();
        renderizar();

        await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

        expect(await screen.findByText('Pantalla de login')).toBeInTheDocument();
        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(localStorage.getItem('auth_usuario')).toBeNull();
    });
});
