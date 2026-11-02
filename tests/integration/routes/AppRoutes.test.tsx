import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

    it('navega desde el catálogo al detalle del evento consultado por id', async () => {
        const evento = {
            id: 5,
            titulo: 'Feria de proyectos',
            descripcion: 'Muestra de proyectos universitarios.',
            fechaInicio: '2026-11-20T14:30:00',
            ubicacion: 'Auditorio central',
            cuposMaximos: 120,
            cuposDisponibles: 38,
            estado: 'PUBLICADO',
            organizadorId: 2,
            organizadorNombre: 'Laura',
            categoriaId: 4,
            categoriaNombre: 'Académico',
        };
        server.use(
            http.get('*/categorias', () => HttpResponse.json([])),
            http.get('*/eventos', () => HttpResponse.json([evento])),
            http.get('*/eventos/5', () => HttpResponse.json(evento)),
        );
        guardarSesion({
            token: 'token-de-prueba',
            usuarioId: 1,
            nombre: 'Ana Ejemplo',
            correo: 'ana@unillanos.edu.co',
            rol: 'USUARIO',
        });
        const usuario = userEvent.setup();
        render(
            <MemoryRouter initialEntries={['/usuario/eventos']}>
                <AppRoutes />
            </MemoryRouter>,
        );

        await usuario.click(await screen.findByRole('link', { name: 'Ver detalle de Feria de proyectos' }));

        expect(await screen.findByRole('heading', { name: 'Feria de proyectos', level: 1 })).toBeInTheDocument();
        expect(screen.getByText('Muestra de proyectos universitarios.')).toBeInTheDocument();
    });
});
