import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { AppRoutes } from '../../../../src/routes/AppRoutes';
import { guardarSesion } from '../../../../src/features/sesion/sesion';
import { server } from '../../../mocks/server';
import type { Evento } from '../../../../src/types/evento';

// Backend simulado con memoria: lo que se crea o cancela se ve en las siguientes consultas
let eventos: Evento[];

const eventoBase = (cambios: Partial<Evento>): Evento => ({
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
        http.get('*/categorias', () => HttpResponse.json([{ id: 1, nombre: 'Académico', activo: true, creadoEn: '2026-01-10T08:00:00', eventosActivos: 1 }])),
        http.get('*/eventos/mios', () => HttpResponse.json(eventos.filter((e) => e.estado === 'PUBLICADO'))),
        http.get('*/eventos/:id', ({ params }) => {
            const evento = eventos.find((e) => e.id === Number(params.id));
            return evento
                ? HttpResponse.json(evento)
                : HttpResponse.json({ error: 'Evento no encontrado.' }, { status: 404 });
        }),
        http.post('*/eventos', async ({ request }) => {
            const datos = (await request.json()) as Partial<Evento>;
            const nuevo = eventoBase({ ...datos, id: eventos.length + 1, cuposDisponibles: datos.cuposMaximos });
            eventos.push(nuevo);
            return HttpResponse.json({ mensaje: 'Evento creado exitosamente.', eventoId: nuevo.id }, { status: 201 });
        }),
        http.put('*/eventos/:id', async ({ params, request }) => {
            const datos = (await request.json()) as Partial<Evento>;
            eventos = eventos.map((e) => (e.id === Number(params.id) ? { ...e, ...datos } : e));
            return HttpResponse.json({ mensaje: 'Evento actualizado exitosamente.', eventoId: Number(params.id) });
        }),
        http.patch('*/eventos/:id/cancelar', ({ params }) => {
            eventos = eventos.map((e) => (e.id === Number(params.id) ? { ...e, estado: 'CANCELADO' } : e));
            return HttpResponse.json({ mensaje: 'El evento «Foro de Ingeniería» fue cancelado.', eventoId: Number(params.id) });
        }),
    );

const abrir = (ruta: string) =>
    render(
        <MemoryRouter initialEntries={[ruta]}>
            <AppRoutes />
        </MemoryRouter>,
    );

// Más tiempo: la primera carga de las pantallas es lenta cuando se mide la cobertura
describe('Gestión de eventos del organizador (HU-05, HU-06, HU-07)', { timeout: 15000 }, () => {
    beforeEach(() => {
        localStorage.clear();
        eventos = [eventoBase({})];
        guardarSesion({ token: 'token-org', usuarioId: 2, nombre: 'Organizador A', correo: 'org.a@unillanos.edu.co', rol: 'ORGANIZADOR' });
        usarBackendSimulado();
    });

    it('crea un evento y lo muestra en Mis eventos con el mensaje de éxito', async () => {
        const usuario = userEvent.setup({ delay: null });
        abrir('/organizador/eventos/nuevo');

        await usuario.type(await screen.findByLabelText(/Título/), 'Feria de ciencias');
        await usuario.type(screen.getByLabelText(/Descripción/), 'Muestra de proyectos estudiantiles');
        await usuario.type(screen.getByLabelText(/Fecha y hora/), '2030-06-10T10:00');
        await usuario.type(screen.getByLabelText(/Ubicación/), 'Auditorio principal');
        await usuario.type(screen.getByLabelText(/Cupo máximo/), '50');
        await usuario.selectOptions(await screen.findByLabelText(/Categoría/), 'Académico');
        await usuario.click(screen.getByRole('button', { name: 'Crear evento' }));

        expect(await screen.findByText('Evento creado exitosamente.')).toBeInTheDocument();
        expect(await screen.findByText('Feria de ciencias')).toBeInTheDocument();
    });

    it('edita un evento y vuelve a Mis eventos con el título nuevo', async () => {
        const usuario = userEvent.setup({ delay: null });
        abrir('/organizador/eventos');

        await usuario.click(await screen.findByRole('link', { name: 'Editar evento Foro de Ingeniería' }));
        const titulo = await screen.findByLabelText(/Título/);
        await usuario.clear(titulo);
        await usuario.type(titulo, 'Nuevo título');
        await usuario.click(screen.getByRole('button', { name: 'Guardar cambios' }));

        expect(await screen.findByText('Evento actualizado exitosamente.')).toBeInTheDocument();
        expect(await screen.findByText('Nuevo título')).toBeInTheDocument();
    });

    it('muestra el rechazo del servidor cuando el evento ya inició al guardar', async () => {
        server.use(
            http.put('*/eventos/:id', () =>
                HttpResponse.json({ error: 'No se puede editar un evento que ya inició.' }, { status: 409 }),
            ),
        );
        const usuario = userEvent.setup({ delay: null });
        abrir('/organizador/eventos/1/editar');

        const titulo = await screen.findByLabelText(/Título/);
        await usuario.type(titulo, ' 2026');
        await usuario.click(screen.getByRole('button', { name: 'Guardar cambios' }));

        expect(await screen.findByText('No se puede editar un evento que ya inició.')).toBeInTheDocument();
    });

    it('cancela un evento: confirma, muestra el mensaje y deja de listarlo', async () => {
        const usuario = userEvent.setup({ delay: null });
        abrir('/organizador/eventos');

        await usuario.click(await screen.findByRole('button', { name: 'Cancelar evento Foro de Ingeniería' }));
        const dialogo = await screen.findByRole('dialog');
        expect(within(dialogo).getByText(/a los 3 usuarios inscritos/)).toBeInTheDocument();
        await usuario.click(within(dialogo).getByRole('button', { name: 'Cancelar evento' }));

        expect(await screen.findByText('El evento «Foro de Ingeniería» fue cancelado.')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Editar evento Foro de Ingeniería' })).not.toBeInTheDocument();
    });
});
