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
                    <Route path="/perfil" element={<p>Pantalla de perfil</p>} />
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
        expect(screen.getByRole('link', { name: 'Actividad' })).toHaveAttribute('href', '/admin/actividad');
        const enlacesAdmin = Array.from(navegacion.querySelectorAll('a')).map((enlace) => enlace.textContent?.trim());
        expect(enlacesAdmin.at(-1)).toContain('Actividad');
        expect(screen.getByText('Juan Pineda')).toHaveAttribute('title', 'Juan Pineda');
        expect(screen.getByText('Administrador')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'Avatar de Juan Pineda' })).toHaveTextContent('JP');
    });

    it('ofrece al organizador explorar eventos, gestionar los propios y ver estadísticas', () => {
        guardarSesion({
            token: 't',
            usuarioId: 2,
            nombre: 'Ana Gómez',
            correo: 'ana@unillanos.edu.co',
            rol: 'ORGANIZADOR',
        });

        renderizar();

        expect(screen.getByRole('link', { name: 'Explorar eventos' })).toHaveAttribute('href', '/eventos');
        expect(screen.getByRole('link', { name: 'Mis inscripciones' })).toHaveAttribute(
            'href',
            '/mis-inscripciones',
        );
        expect(screen.getByRole('link', { name: 'Mis eventos' })).toHaveAttribute('href', '/organizador/eventos');
        expect(screen.getByRole('link', { name: 'Estadísticas' })).toHaveAttribute('href', '/organizador/estadisticas');
        expect(screen.queryByRole('link', { name: 'Categorías' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Organizadores' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Actividad' })).not.toBeInTheDocument();
        expect(screen.getByText('Ana Gómez')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'Avatar de Ana Gómez' })).toHaveTextContent('AG');
    });

    it('ofrece al usuario navegación directa al catálogo de eventos', () => {
        guardarSesion({
            token: 't',
            usuarioId: 3,
            nombre: 'Juan Pérez',
            correo: 'juan@unillanos.edu.co',
            rol: 'USUARIO',
        });

        renderizar();

        expect(screen.getByRole('link', { name: 'Eventos en campus' })).toHaveAttribute(
            'href',
            '/eventos',
        );
        expect(screen.getByRole('link', { name: 'Mis inscripciones' })).toHaveAttribute(
            'href',
            '/mis-inscripciones',
        );
        expect(screen.queryByRole('link', { name: 'Mis eventos' })).not.toBeInTheDocument();
    });

    it('permite abrir y cerrar el menú de navegación desde el control móvil', async () => {
        guardarSesion({
            token: 't',
            usuarioId: 2,
            nombre: 'Ana Gómez',
            correo: 'ana@unillanos.edu.co',
            rol: 'ORGANIZADOR',
        });
        const user = userEvent.setup();
        renderizar();

        const boton = screen.getByRole('button', { name: 'Abrir navegación' });
        await user.click(boton);
        expect(screen.getByRole('button', { name: 'Cerrar navegación' })).toHaveAttribute(
            'aria-expanded',
            'true',
        );
        expect(screen.getByRole('navigation', { name: 'Principal' })).toHaveClass(
            'max-[639px]:absolute',
        );

        await user.keyboard('{Escape}');
        expect(screen.getByRole('button', { name: 'Abrir navegación' })).toHaveAttribute(
            'aria-expanded',
            'false',
        );
        expect(screen.getByRole('button', { name: 'Abrir navegación' })).toHaveFocus();
    });

    it('muestra una sola inicial para nombres de una palabra', () => {
        guardarSesion({
            token: 'jwt-de-prueba',
            usuarioId: 1,
            nombre: 'Madonna',
            correo: 'ana@unillanos.edu.co',
            rol: 'USUARIO',
        });
        renderizar();

        expect(screen.getByRole('img', { name: 'Avatar de Madonna' })).toHaveTextContent('M');
        expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument();
        expect(localStorage.getItem('auth_token')).toBe('jwt-de-prueba');
    });

    it('abre el menú y navega a la pantalla de perfil', async () => {
        guardarSesion({
            token: 'jwt-de-prueba',
            usuarioId: 1,
            nombre: 'Ana Gómez',
            correo: 'ana@unillanos.edu.co',
            rol: 'ORGANIZADOR',
        });
        const user = userEvent.setup();
        renderizar();

        await user.click(screen.getByRole('button', { name: 'Menú de perfil de Ana Gómez' }));

        expect(screen.getByRole('menu', { name: 'Opciones de perfil' })).toBeInTheDocument();
        await user.click(screen.getByRole('menuitem', { name: 'Perfil' }));
        expect(await screen.findByText('Pantalla de perfil')).toBeInTheDocument();
    });

    it('mantiene disponible cerrar sesión en el menú de perfil', async () => {
        guardarSesion({
            token: 'jwt-de-prueba',
            usuarioId: 1,
            nombre: 'Ana Gómez',
            correo: 'ana@unillanos.edu.co',
            rol: 'ORGANIZADOR',
        });
        const user = userEvent.setup();
        renderizar();

        await user.click(screen.getByRole('button', { name: 'Menú de perfil de Ana Gómez' }));
        await user.click(screen.getByRole('menuitem', { name: 'Cerrar sesión' }));

        expect(await screen.findByText('Pantalla de login')).toBeInTheDocument();
        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(localStorage.getItem('auth_usuario')).toBeNull();
    });
});
