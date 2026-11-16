import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { AppRoutes } from '../../../../src/routes/AppRoutes';
import { guardarSesion } from '../../../../src/features/sesion/sesion';
import { server } from '../../../mocks/server';

const eventoHoy = {
    id: 7,
    titulo: 'Taller de primeros auxilios',
    descripcion: 'Taller práctico',
    fechaInicio: '2030-05-20T10:00:00',
    ubicacion: 'Laboratorio 2',
    cuposMaximos: 30,
    cuposDisponibles: 28,
    estado: 'PUBLICADO',
    certificable: true,
    organizadorId: 2,
    organizadorNombre: 'Organizador A',
    categoriaId: 1,
    categoriaNombre: 'Académico',
};

const inscritos = [
    { inscripcionId: 5, usuarioId: 4, nombre: 'Estudiante Uno', correo: 'estudiante1@unillanos.edu.co', fechaInscripcion: '2026-11-01T10:00:00', asistio: true },
    { inscripcionId: 6, usuarioId: 5, nombre: 'Estudiante Dos', correo: 'estudiante2@unillanos.edu.co', fechaInscripcion: '2026-11-02T10:00:00', asistio: false },
];

const abrir = (ruta: string) =>
    render(
        <MemoryRouter initialEntries={[ruta]}>
            <AppRoutes />
        </MemoryRouter>,
    );

// Más tiempo: la primera carga de las pantallas es lenta cuando se mide la cobertura
describe('Inscritos de un evento y reporte PDF (HU-13, HU-17)', { timeout: 15000 }, () => {
    beforeEach(() => {
        localStorage.clear();
        guardarSesion({ token: 'token-org', usuarioId: 2, nombre: 'Organizador A', correo: 'org.a@unillanos.edu.co', rol: 'ORGANIZADOR' });
    });

    it('lista los inscritos con su asistencia y ofrece el reporte PDF', async () => {
        server.use(
            http.get('*/eventos/:id/inscritos', () => HttpResponse.json(inscritos)),
            http.get('*/eventos/:id', () => HttpResponse.json(eventoHoy)),
        );
        abrir('/organizador/eventos/7/inscritos');

        expect(await screen.findByRole('heading', { name: 'Taller de primeros auxilios' })).toBeInTheDocument();
        expect((await screen.findAllByText('Estudiante Uno')).length).toBeGreaterThan(0);
        expect(screen.getAllByText('Asistió').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0);
        // La descarga del PDF se prueba con el servicio simulado: jsdom no maneja archivos binarios con MSW
        expect(screen.getByRole('button', { name: 'Reporte PDF' })).toBeEnabled();
    });

    it('muestra el mensaje de evento sin inscritos', async () => {
        server.use(
            http.get('*/eventos/:id/inscritos', () => HttpResponse.json([])),
            http.get('*/eventos/:id', () => HttpResponse.json({ ...eventoHoy, cuposDisponibles: 30 })),
        );
        abrir('/organizador/eventos/7/inscritos');

        expect(await screen.findByText('Este evento aún no tiene inscripciones activas.')).toBeInTheDocument();
    });
});
