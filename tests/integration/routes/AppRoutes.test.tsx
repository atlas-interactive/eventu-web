import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../../../src/routes/AppRoutes';
import { guardarSesion } from '../../../src/features/sesion/sesion';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';

describe('AppRoutes', () => {
    beforeEach(() => localStorage.clear());

    it('redirige una ruta desconocida al login y carga el formulario diferido', async () => {
        render(
            <MemoryRouter initialEntries={['/ruta-inexistente']}>
                <AppRoutes />
            </MemoryRouter>,
        );

        expect(await screen.findByLabelText('Correo institucional')).toBeInTheDocument();
    });

    it('redirige /usuario al catálogo de campus para una sesión con rol USUARIO', async () => {
        server.use(
            http.get('*/categorias', () => HttpResponse.json([])),
            http.get('*/eventos', () => HttpResponse.json([])),
        );
        guardarSesion({
            token: 'token-de-prueba',
            usuarioId: 1,
            nombre: 'Ana Ejemplo',
            correo: 'ana@unillanos.edu.co',
            rol: 'USUARIO',
        });
        render(
            <MemoryRouter initialEntries={['/usuario']}>
                <AppRoutes />
            </MemoryRouter>,
        );

        expect(await screen.findByRole('heading', { name: 'Eventos en campus' })).toBeInTheDocument();
    });

    it('renderiza el catálogo directamente en /usuario/eventos', async () => {
        server.use(
            http.get('*/categorias', () => HttpResponse.json([])),
            http.get('*/eventos', () => HttpResponse.json([])),
        );
        guardarSesion({
            token: 'token-de-prueba',
            usuarioId: 1,
            nombre: 'Ana Ejemplo',
            correo: 'ana@unillanos.edu.co',
            rol: 'USUARIO',
        });

        render(
            <MemoryRouter initialEntries={['/usuario/eventos']}>
                <AppRoutes />
            </MemoryRouter>,
        );

        expect(await screen.findByRole('heading', { name: 'Eventos en campus' })).toBeInTheDocument();
    });
});
