import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CatalogoEventos } from '../../../../src/features/eventos/pages/CatalogoEventos';
import { listarCategorias } from '../../../../src/features/categorias/services/categoriaService';
import { listarEventos } from '../../../../src/features/eventos/services/eventoService';
import type { Evento } from '../../../../src/types/evento';

vi.mock('../../../../src/features/categorias/services/categoriaService', () => ({
    listarCategorias: vi.fn(),
}));

vi.mock('../../../../src/features/eventos/services/eventoService', () => ({
    listarEventos: vi.fn(),
}));

const listarCategoriasMock = vi.mocked(listarCategorias);
const listarEventosMock = vi.mocked(listarEventos);

const evento: Evento = {
    id: 5,
    titulo: 'Feria de proyectos',
    descripcion: 'Muestra de proyectos universitarios',
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

describe('CatalogoEventos (HU-08)', () => {
    beforeEach(() => {
        listarCategoriasMock.mockReset().mockResolvedValue([
            { id: 4, nombre: 'Académico', activo: true, creadoEn: '', eventosActivos: 1 },
        ]);
        listarEventosMock.mockReset().mockResolvedValue([evento]);
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('muestra el catálogo y enlaza cada evento con su detalle', async () => {
        render(
            <MemoryRouter>
                <CatalogoEventos />
            </MemoryRouter>,
        );

        expect(await screen.findByRole('heading', { name: 'Eventos en campus' })).toBeInTheDocument();
        expect(await screen.findByRole('heading', { name: 'Feria de proyectos' })).toBeInTheDocument();
        expect(listarCategoriasMock).toHaveBeenCalledWith(true);
        expect(screen.getByRole('button', { name: 'Académico' })).toBeInTheDocument();
        expect(screen.getByText('38 cupos disponibles de 120')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ver detalle de Feria de proyectos' })).toHaveAttribute(
            'href',
            '/usuario/eventos/5',
        );
    });

    it('envía al backend la categoría elegida en los filtros del catálogo', async () => {
        const usuario = userEvent.setup();
        render(
            <MemoryRouter>
                <CatalogoEventos />
            </MemoryRouter>,
        );

        await screen.findByRole('heading', { name: 'Feria de proyectos' });
        await usuario.click(screen.getByRole('button', { name: 'Académico' }));

        await vi.waitFor(() => expect(listarEventosMock).toHaveBeenCalledTimes(2));
        expect(listarEventosMock).toHaveBeenLastCalledWith({ categoriaId: 4 });
    });
});
