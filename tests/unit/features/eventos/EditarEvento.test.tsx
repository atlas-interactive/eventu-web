import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditarEvento } from '../../../../src/features/eventos/EditarEvento';
import { editarEvento, listarEventos } from '../../../../src/features/eventos/services/eventoService';
import { listarCategorias } from '../../../../src/features/categorias/services/categoriaService';
import type { Evento } from '../../../../src/types/evento';

vi.mock('../../../../src/features/eventos/services/eventoService', () => ({
    crearEvento: vi.fn(),
    editarEvento: vi.fn(),
    listarEventos: vi.fn(),
}));
vi.mock('../../../../src/features/categorias/services/categoriaService', () => ({
    listarCategorias: vi.fn(),
}));

const editarMock = vi.mocked(editarEvento);
const listarEventosMock = vi.mocked(listarEventos);
const listarCategoriasMock = vi.mocked(listarCategorias);

const evento: Evento = {
    id: 7,
    titulo: 'Feria de ciencia',
    descripcion: 'Proyectos estudiantiles',
    fechaInicio: '2099-10-20T14:30:00',
    ubicacion: 'Auditorio',
    cuposMaximos: 50,
    cuposDisponibles: 30,
    estado: 'PUBLICADO',
    organizadorId: 3,
    organizadorNombre: 'Laura',
    categoriaId: 2,
    categoriaNombre: 'Cultural',
};

function DestinoEventos() {
    const location = useLocation();
    const mensaje = (location.state as { mensaje?: string } | null)?.mensaje;
    return <p>{mensaje ?? 'Listado de eventos'}</p>;
}

const renderizar = () =>
    render(
        <MemoryRouter initialEntries={['/organizador/eventos/7/editar']}>
            <Routes>
                <Route path="/organizador/eventos/:id/editar" element={<EditarEvento />} />
                <Route path="/organizador/eventos" element={<DestinoEventos />} />
            </Routes>
        </MemoryRouter>,
    );

describe('EditarEvento (HU-06)', () => {
    beforeEach(() => {
        editarMock.mockReset();
        listarEventosMock.mockReset().mockResolvedValue([evento]);
        listarCategoriasMock.mockReset().mockResolvedValue([
            { id: 2, nombre: 'Cultural', activo: true, eventosActivos: 1, creadoEn: '2026-10-01T10:00:00' },
        ]);
    });

    afterEach(cleanup);

    it('carga el evento, guarda los cambios y navega al listado', async () => {
        const user = userEvent.setup();
        editarMock.mockResolvedValue({ mensaje: 'Evento actualizado exitosamente.', eventoId: 7 });
        renderizar();

        const ubicacion = await screen.findByLabelText(/Ubicación/);
        expect(ubicacion).toHaveValue('Auditorio');
        await user.clear(ubicacion);
        await user.type(ubicacion, 'Biblioteca');
        await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

        await waitFor(() => expect(editarMock).toHaveBeenCalledWith(7, { ubicacion: 'Biblioteca' }));
        expect(await screen.findByText('Evento actualizado exitosamente.')).toBeInTheDocument();
    });

    it('muestra un error cuando el evento no existe en el listado', async () => {
        listarEventosMock.mockResolvedValue([]);
        renderizar();

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'No se encontró el evento, o ya no se puede editar.',
        );
        expect(screen.queryByRole('form')).not.toBeInTheDocument();
        expect(listarCategoriasMock).not.toHaveBeenCalled();
    });
});
