import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { AppRoutes } from '../../../../src/routes/AppRoutes';
import { guardarSesion } from '../../../../src/features/sesion/sesion';
import { server } from '../../../mocks/server';

const abrir = (ruta: string) =>
    render(
        <MemoryRouter initialEntries={[ruta]}>
            <AppRoutes />
        </MemoryRouter>,
    );

const sesion = (rol: string) =>
    guardarSesion({ token: `token-${rol}`, usuarioId: 1, nombre: 'Prueba', correo: 'prueba@unillanos.edu.co', rol });

// Más tiempo: la primera carga de las pantallas es lenta cuando se mide la cobertura
describe('Estadísticas (HU-16)', { timeout: 15000 }, () => {
    beforeEach(() => localStorage.clear());

    it('muestra al organizador solo los indicadores de sus eventos', async () => {
        server.use(
            http.get('*/estadisticas', () =>
                HttpResponse.json({
                    inscripcionesActivas: 8,
                    asistentes: 3,
                    porcentajeAsistencia: 37.5,
                    categoriasMasConcurridas: [],
                    eventosConMasInscritos: [],
                }),
            ),
        );
        sesion('ORGANIZADOR');
        abrir('/organizador/estadisticas');

        expect(await screen.findByText('Participación en los eventos que creaste.')).toBeInTheDocument();
        expect(await screen.findByRole('heading', { name: 'Inscripciones activas', level: 2 })).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Categorías más concurridas' })).not.toBeInTheDocument();
    });

    it('muestra al administrador los indicadores generales y los rankings', async () => {
        server.use(
            http.get('*/estadisticas', () =>
                HttpResponse.json({
                    inscripcionesActivas: 40,
                    asistentes: 12,
                    porcentajeAsistencia: 30,
                    categoriasMasConcurridas: [{ categoria: 'Académico', inscripcionesActivas: 25 }],
                    eventosConMasInscritos: [{ eventoId: 1, titulo: 'Foro de Ingeniería', inscripcionesActivas: 10 }],
                }),
            ),
        );
        sesion('ADMIN');
        abrir('/admin/estadisticas');

        expect(await screen.findByText('Participación en todos los eventos de la plataforma.')).toBeInTheDocument();
        expect(await screen.findByRole('heading', { name: 'Categorías más concurridas' })).toBeInTheDocument();
        expect(screen.getByText('Foro de Ingeniería')).toBeInTheDocument();
    });

    it('impide a un usuario sin rol de organizador ver las estadísticas', async () => {
        sesion('USUARIO');
        abrir('/organizador/estadisticas');

        expect(await screen.findByText('No tienes permisos para ver esta pantalla.')).toBeInTheDocument();
    });
});
