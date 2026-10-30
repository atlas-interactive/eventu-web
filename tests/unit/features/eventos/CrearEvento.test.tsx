import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CrearEvento } from '../../../../src/features/eventos/CrearEvento';
import { crearEvento } from '../../../../src/features/eventos/services/eventoService';
import { listarCategorias } from '../../../../src/features/categorias/services/categoriaService';

vi.mock('../../../../src/features/eventos/services/eventoService', () => ({
    crearEvento: vi.fn(),
    editarEvento: vi.fn(),
}));
vi.mock('../../../../src/features/categorias/services/categoriaService', () => ({
    listarCategorias: vi.fn(),
}));

const crearMock = vi.mocked(crearEvento);
const listarCategoriasMock = vi.mocked(listarCategorias);

function DestinoEventos() {
    const location = useLocation();
    const mensaje = (location.state as { mensaje?: string } | null)?.mensaje;
    return <p>{mensaje ?? 'Listado de eventos'}</p>;
}

describe('CrearEvento (HU-05)', () => {
    beforeEach(() => {
        crearMock.mockReset();
        listarCategoriasMock.mockReset().mockResolvedValue([
            { id: 2, nombre: 'Cultural', activo: true, eventosActivos: 0, creadoEn: '2026-10-01T10:00:00' },
        ]);
    });

    afterEach(cleanup);

    it('crea el evento desde la página y navega al listado con el resultado', async () => {
        const user = userEvent.setup();
        crearMock.mockResolvedValue({ mensaje: 'Evento creado exitosamente.', eventoId: 9 });
        render(
            <MemoryRouter initialEntries={['/organizador/eventos/nuevo']}>
                <Routes>
                    <Route path="/organizador/eventos/nuevo" element={<CrearEvento />} />
                    <Route path="/organizador/eventos" element={<DestinoEventos />} />
                </Routes>
            </MemoryRouter>,
        );

        await user.type(screen.getByLabelText(/Título/), 'Feria cultural');
        await user.type(screen.getByLabelText(/Descripción/), 'Muestra artística');
        await user.type(screen.getByLabelText(/Fecha y hora/), '2099-10-20T14:30');
        await user.type(screen.getByLabelText(/Ubicación/), 'Auditorio');
        await user.type(screen.getByLabelText(/Cupo máximo/), '40');
        await user.selectOptions(await screen.findByLabelText(/Categoría/), '2');
        await user.click(screen.getByRole('button', { name: 'Crear evento' }));

        await waitFor(() => {
            expect(crearMock).toHaveBeenCalledWith({
                titulo: 'Feria cultural',
                descripcion: 'Muestra artística',
                fechaInicio: '2099-10-20T14:30',
                ubicacion: 'Auditorio',
                cuposMaximos: 40,
                categoriaId: 2,
            });
        });
        expect(await screen.findByText('Evento creado exitosamente.')).toBeInTheDocument();
    });
});
