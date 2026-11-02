import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DetalleEvento } from '../../../../src/features/eventos/DetalleEvento';
import { obtenerEvento } from '../../../../src/features/eventos/services/eventoService';
import type { Evento } from '../../../../src/types/evento';

vi.mock('../../../../src/features/eventos/services/eventoService', () => ({
    obtenerEvento: vi.fn(),
}));

const obtenerEventoMock = vi.mocked(obtenerEvento);

const evento: Evento = {
    id: 5,
    titulo: 'Feria de proyectos',
    descripcion: 'Espacio para la presentación de proyectos innovadores.',
    fechaInicio: '2026-09-12T09:00:00',
    ubicacion: 'Auditorio Eduardo Carranza, Unillanos',
    cuposMaximos: 120,
    cuposDisponibles: 38,
    estado: 'PUBLICADO',
    organizadorId: 2,
    organizadorNombre: 'Facultad de Ciencias Básicas e Ingeniería',
    categoriaId: 4,
    categoriaNombre: 'Académico',
};

const renderDetalle = (ruta = '/eventos/5') =>
    render(
        <MemoryRouter initialEntries={[ruta]}>
            <Routes>
                <Route path="/eventos/:id" element={<DetalleEvento />} />
                <Route path="/usuario/eventos/:id" element={<DetalleEvento />} />
            </Routes>
        </MemoryRouter>,
    );

describe('DetalleEvento', () => {
    beforeEach(() => {
        obtenerEventoMock.mockReset().mockResolvedValue(evento);
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('consulta el evento y muestra sus datos con inscripción disponible', async () => {
        renderDetalle();

        expect(await screen.findByRole('heading', { name: 'Feria de proyectos' })).toBeInTheDocument();
        expect(obtenerEventoMock).toHaveBeenCalledWith(5);
        expect(screen.getByText('Espacio para la presentación de proyectos innovadores.')).toBeInTheDocument();
        expect(screen.getByText(/82\s+inscritos de\s+120 cupos/)).toBeInTheDocument();
        expect(screen.getByText('38 cupos disponibles')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Inscribirme al evento; inscripción no disponible' })).toBeDisabled();
    });

    it('indica que no hay cupos disponibles cuando el evento está agotado', async () => {
        obtenerEventoMock.mockResolvedValue({ ...evento, cuposDisponibles: 0 });
        renderDetalle();

        expect(await screen.findAllByText('Cupos agotados')).toHaveLength(2);
        expect(screen.getByText(/120\s+inscritos de\s+120 cupos/)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Inscribirme/ })).not.toBeInTheDocument();
    });

    it('muestra el estado cancelado aunque el evento conserve cupos', async () => {
        obtenerEventoMock.mockResolvedValue({ ...evento, estado: 'CANCELADO' });
        renderDetalle();

        expect(await screen.findAllByText('Evento cancelado')).toHaveLength(2);
        expect(screen.queryByRole('button', { name: /Inscribirme/ })).not.toBeInTheDocument();
    });

    it('muestra un mensaje y enlace de regreso cuando el evento no existe', async () => {
        const error404 = Object.assign(new Error('No encontrado'), {
            isAxiosError: true,
            response: { status: 404 },
        });
        obtenerEventoMock.mockRejectedValue(error404);
        renderDetalle();

        expect(await screen.findByRole('alert')).toHaveTextContent('No se encontró el evento solicitado.');
        expect(screen.getByRole('link', { name: '← Volver a eventos' })).toHaveAttribute('href', '/eventos');
    });

    it('no consulta cuando el id de la ruta no es válido', async () => {
        renderDetalle('/eventos/abc');

        expect(await screen.findByRole('alert')).toHaveTextContent('No se encontró el evento solicitado.');
        expect(obtenerEventoMock).not.toHaveBeenCalled();
    });
});
