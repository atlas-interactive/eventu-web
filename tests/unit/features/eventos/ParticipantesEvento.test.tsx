import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ParticipantesEvento } from '../../../../src/features/eventos/pages/ParticipantesEvento';
import { listarInscritosEvento, obtenerEvento } from '../../../../src/features/eventos/services/eventoService';
import type { Evento, InscritoEvento } from '../../../../src/types/evento';

vi.mock('../../../../src/features/eventos/services/eventoService', () => ({
    listarInscritosEvento: vi.fn(),
    obtenerEvento: vi.fn(),
}));

const evento: Evento = {
    id: 5,
    titulo: 'Feria de proyectos',
    descripcion: 'Descripción',
    fechaInicio: '2026-09-10T14:00:00',
    ubicacion: 'Auditorio',
    cuposMaximos: 120,
    cuposDisponibles: 38,
    estado: 'PUBLICADO',
    organizadorId: 2,
    organizadorNombre: 'Laura',
    categoriaId: 4,
    categoriaNombre: 'Académico',
};

const inscritos: InscritoEvento[] = [
    {
        inscripcionId: 31,
        usuarioId: 10,
        nombre: 'Laura Gómez',
        correo: 'laura.gomez@unillanos.edu.co',
        fechaInscripcion: '2026-09-10T14:20:00',
        asistio: true,
    },
    {
        inscripcionId: 32,
        usuarioId: 11,
        nombre: 'Carlos Ramírez',
        correo: 'carlos@unillanos.edu.co',
        fechaInscripcion: '2026-09-11T09:15:00',
        asistio: false,
    },
];

const obtenerEventoMock = vi.mocked(obtenerEvento);
const listarInscritosMock = vi.mocked(listarInscritosEvento);

const renderizar = (ruta = '/organizador/eventos/5/inscritos') =>
    render(
        <MemoryRouter initialEntries={[ruta]}>
            <Routes>
                <Route path="/organizador/eventos/:id/inscritos" element={<ParticipantesEvento />} />
            </Routes>
        </MemoryRouter>,
    );

describe('ParticipantesEvento', () => {
    beforeEach(() => {
        obtenerEventoMock.mockReset().mockResolvedValue(evento);
        listarInscritosMock.mockReset().mockResolvedValue(inscritos);
    });

    afterEach(cleanup);

    it('muestra los datos del evento, métricas e inscritos con su asistencia', async () => {
        renderizar();

        expect(await screen.findByRole('heading', { name: 'Feria de proyectos' })).toBeInTheDocument();
        expect(screen.getByText('Feria de proyectos')).toBeInTheDocument();
        expect(screen.getByText('2', { selector: 'strong' })).toBeInTheDocument();
        expect(screen.getByText('/ 120', { selector: 'small' })).toBeInTheDocument();
        expect(screen.getByText('de 120', { selector: 'small' })).toBeInTheDocument();
        expect(screen.getByText('38', { selector: 'strong' })).toBeInTheDocument();
        expect(screen.getAllByText('Laura Gómez')).toHaveLength(2);
        expect(screen.getAllByText('laura.gomez@unillanos.edu.co')).toHaveLength(2);
        expect(screen.getAllByText('Asistió')).toHaveLength(2);
        expect(screen.getAllByText('Pendiente')).toHaveLength(2);
        expect(obtenerEventoMock).toHaveBeenCalledWith(5);
        expect(listarInscritosMock).toHaveBeenCalledWith(5);
    });

    it('filtra por nombre o correo ignorando mayúsculas y tildes', async () => {
        const user = userEvent.setup();
        renderizar();

        const campo = await screen.findByRole('searchbox', { name: 'Buscar por nombre o correo' });
        await user.type(campo, 'ramirez');

        expect(screen.getAllByText('Carlos Ramírez')).toHaveLength(2);
        expect(screen.queryAllByText('Laura Gómez')).toHaveLength(0);
        await user.clear(campo);
        await user.type(campo, 'LAURA.GOMEZ@');
        expect(screen.getAllByText('Laura Gómez')).toHaveLength(2);
        expect(screen.queryAllByText('Carlos Ramírez')).toHaveLength(0);
    });

    it('muestra el estado vacío si el evento no tiene inscritos activos', async () => {
        listarInscritosMock.mockResolvedValue([]);
        renderizar();

        expect(await screen.findByText('Este evento aún no tiene inscripciones activas.')).toBeInTheDocument();
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('muestra el estado vacío de la búsqueda cuando no hay coincidencias', async () => {
        const user = userEvent.setup();
        renderizar();

        await user.type(
            await screen.findByRole('searchbox', { name: 'Buscar por nombre o correo' }),
            'no-existe',
        );

        expect(screen.getByRole('status')).toHaveTextContent(
            'No se encontraron participantes con esos criterios.',
        );
    });

    it('muestra el error de acceso enviado por el backend', async () => {
        const errorConsola = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        listarInscritosMock.mockRejectedValue({
            isAxiosError: true,
            response: { data: { error: 'No tienes permiso para consultar este evento.' } },
        });
        renderizar();

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'No tienes permiso para consultar este evento.',
        );
        errorConsola.mockRestore();
    });

    it('ofrece volver a la gestión de eventos', async () => {
        renderizar();

        const volver = await screen.findByRole('link', { name: /Mis eventos/ });
        expect(volver).toHaveAttribute('href', '/organizador/eventos');
    });
});
