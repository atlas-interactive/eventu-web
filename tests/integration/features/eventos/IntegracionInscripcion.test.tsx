import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { AppRoutes } from '../../../../src/routes/AppRoutes';
import { guardarSesion } from '../../../../src/features/sesion/sesion';
import { server } from '../../../mocks/server';
import type { Evento } from '../../../../src/types/evento';
import type { Inscripcion } from '../../../../src/types/inscripcion';

// Backend simulado con memoria: la inscripción creada aparece en las consultas siguientes
let eventos: Evento[];
let inscripciones: Inscripcion[];
let filtrosRecibidos: URLSearchParams | null;

const evento = (cambios: Partial<Evento>): Evento => ({
    id: 1,
    titulo: 'Foro de Ingeniería',
    descripcion: 'Muestra de proyectos de ingeniería',
    fechaInicio: '2030-05-20T10:00:00',
    ubicacion: 'Auditorio Central',
    cuposMaximos: 10,
    cuposDisponibles: 7,
    estado: 'PUBLICADO',
    certificable: false,
    organizadorId: 2,
    organizadorNombre: 'Organizador A',
    categoriaId: 1,
    categoriaNombre: 'Académico',
    ...cambios,
});

const usarBackendSimulado = () =>
    server.use(
        http.get('*/categorias', () =>
            HttpResponse.json([
                { id: 1, nombre: 'Académico', activo: true, creadoEn: '2026-01-10T08:00:00', eventosActivos: 1 },
                { id: 3, nombre: 'Deportivo', activo: true, creadoEn: '2026-01-10T08:00:00', eventosActivos: 1 },
            ]),
        ),
        http.get('*/eventos', ({ request }) => {
            filtrosRecibidos = new URL(request.url).searchParams;
            const categoria = filtrosRecibidos.get('categoriaId');
            return HttpResponse.json(categoria ? eventos.filter((e) => e.categoriaId === Number(categoria)) : eventos);
        }),
        http.get('*/eventos/:id', ({ params }) => {
            const encontrado = eventos.find((e) => e.id === Number(params.id));
            return encontrado
                ? HttpResponse.json(encontrado)
                : HttpResponse.json({ error: 'Evento no encontrado.' }, { status: 404 });
        }),
        http.get('*/inscripciones/mias', () => HttpResponse.json(inscripciones)),
        http.post('*/inscripciones', ({ request }) => {
            const eventoId = Number(new URL(request.url).searchParams.get('eventoId'));
            const elegido = eventos.find((e) => e.id === eventoId)!;
            inscripciones.push({
                id: 50,
                estado: 'ACTIVA',
                codigoQr: 'QR-INTEGRACION',
                fechaInscripcion: '2026-11-15T10:00:00',
                eventoId,
                eventoTitulo: elegido.titulo,
                eventoFechaInicio: elegido.fechaInicio,
                eventoUbicacion: elegido.ubicacion,
            });
            eventos = eventos.map((e) => (e.id === eventoId ? { ...e, cuposDisponibles: e.cuposDisponibles - 1 } : e));
            return HttpResponse.json(
                { mensaje: 'Inscripción realizada exitosamente.', inscripcionId: 50, codigoQr: 'QR-INTEGRACION' },
                { status: 201 },
            );
        }),
    );

const abrir = (ruta: string) =>
    render(
        <MemoryRouter initialEntries={[ruta]}>
            <AppRoutes />
        </MemoryRouter>,
    );

// Más tiempo: la primera carga de las pantallas es lenta cuando se mide la cobertura
describe('Catálogo, detalle e inscripción (HU-08, HU-09, HU-10)', { timeout: 15000 }, () => {
    beforeEach(() => {
        localStorage.clear();
        eventos = [
            evento({}),
            evento({ id: 2, titulo: 'Torneo de ajedrez', categoriaId: 3, categoriaNombre: 'Deportivo', ubicacion: 'Sala de juegos', cuposMaximos: 20, cuposDisponibles: 20 }),
        ];
        inscripciones = [];
        filtrosRecibidos = null;
        guardarSesion({ token: 'token-est', usuarioId: 4, nombre: 'Estudiante Uno', correo: 'estudiante1@unillanos.edu.co', rol: 'USUARIO' });
        usarBackendSimulado();
    });

    it('filtra por categoría, abre el detalle y se inscribe con cupo disponible', async () => {
        const usuario = userEvent.setup({ delay: null });
        abrir('/eventos');

        expect(await screen.findByRole('heading', { name: 'Foro de Ingeniería' })).toBeInTheDocument();
        await usuario.click(await screen.findByRole('button', { name: 'Deportivo' }));

        expect(await screen.findByRole('heading', { name: 'Torneo de ajedrez' })).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Foro de Ingeniería' })).not.toBeInTheDocument();
        expect(filtrosRecibidos?.get('categoriaId')).toBe('3');

        await usuario.click(screen.getByRole('link', { name: 'Ver detalle de Torneo de ajedrez' }));
        expect(await screen.findByText('20 de 20 disponibles')).toBeInTheDocument();
        expect(screen.getAllByText('Sala de juegos').length).toBeGreaterThan(0);

        await usuario.click(await screen.findByRole('button', { name: 'Inscribirme al evento' }));

        expect((await screen.findAllByText('Estás inscrito')).length).toBeGreaterThan(0);
        expect(await screen.findByText('19 de 20 disponibles')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Inscribirme al evento' })).not.toBeInTheDocument();
    });

    it('no ofrece inscribirse cuando el evento no tiene cupos', async () => {
        eventos = [evento({ id: 3, titulo: 'Charla de emprendimiento', cuposMaximos: 1, cuposDisponibles: 0 })];
        abrir('/eventos/3');

        expect(await screen.findByRole('heading', { name: 'Charla de emprendimiento' })).toBeInTheDocument();
        expect(await screen.findByText('0 de 1 disponibles')).toBeInTheDocument();
        expect(screen.getAllByText('Cupos agotados').length).toBeGreaterThan(0);
        expect(screen.queryByRole('button', { name: 'Inscribirme al evento' })).not.toBeInTheDocument();
    });

    it('muestra que el evento no existe cuando el servidor responde 404', async () => {
        abrir('/eventos/999');

        expect(await screen.findByText('No se encontró el evento solicitado.')).toBeInTheDocument();
    });
});
