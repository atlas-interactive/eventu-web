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
    certificable: false,
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
        expect(screen.getByRole('group', { name: 'Filtrar por categoría' })).toBeInTheDocument();
        expect(screen.getByRole('group', { name: 'Rangos de fecha rápidos' })).toBeInTheDocument();
        expect(screen.getByRole('group', { name: 'Fecha:' })).toBeInTheDocument();
        expect(screen.queryByText('Certificable')).not.toBeInTheDocument();
        expect(listarCategoriasMock).toHaveBeenCalledWith(true);
        expect(screen.getByRole('button', { name: 'Académico' })).toBeInTheDocument();
        expect(screen.getByRole('meter', { name: 'Cupos ocupados de Feria de proyectos' })).toHaveAttribute(
            'aria-valuenow',
            '82',
        );
        expect(screen.getByRole('link', { name: 'Ver detalle de Feria de proyectos' })).toHaveAttribute(
            'href',
            '/eventos/5',
        );
    });

    it('muestra la etiqueta Certificable solo si el evento tiene certificación habilitada', async () => {
        listarEventosMock.mockResolvedValue([{ ...evento, certificable: true }]);
        render(
            <MemoryRouter>
                <CatalogoEventos />
            </MemoryRouter>,
        );

        expect(await screen.findByText('Certificable')).toBeInTheDocument();
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
        const orden = screen.getByRole('combobox', { name: 'Ordenar eventos' });
        expect(orden.parentElement).toHaveClass('selector-con-chevron--compact');
        expect(orden.parentElement?.querySelector('svg')).toBeInTheDocument();
    });
});
