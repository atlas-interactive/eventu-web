import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { MisInscripciones } from '../../../../src/features/inscripciones/pages/MisInscripciones';
import { listarMisInscripciones } from '../../../../src/features/inscripciones/services/inscripcionService';
import type { Inscripcion } from '../../../../src/types/inscripcion';

vi.mock('../../../../src/features/inscripciones/services/inscripcionService', () => ({
    listarMisInscripciones: vi.fn(),
}));

const inscripciones: Inscripcion[] = [
    {
        id: 8,
        estado: 'ACTIVA',
        codigoQr: 'NO-RENDERIZAR-QR',
        fechaInscripcion: '2026-03-01T10:00:00',
        eventoId: 5,
        eventoTitulo: 'Festival universitario',
        eventoFechaInicio: '2026-04-02T09:00:00',
        eventoUbicacion: 'Campus',
    },
    {
        id: 9,
        estado: 'CANCELADA',
        codigoQr: 'TAMPOCO-RENDERIZAR',
        fechaInscripcion: '2026-03-02T10:00:00',
        eventoId: 6,
        eventoTitulo: 'Feria cultural',
        eventoFechaInicio: '2026-05-04T14:30:00',
        eventoUbicacion: 'Auditorio',
    },
];

const listarMock = vi.mocked(listarMisInscripciones);

const renderizar = () =>
    render(
        <MemoryRouter>
            <MisInscripciones />
        </MemoryRouter>,
    );

describe('MisInscripciones', () => {
    beforeEach(() => {
        listarMock.mockReset();
        listarMock.mockResolvedValue(inscripciones);
    });

    afterEach(cleanup);

    it('muestra el listado, los estados y los contadores sin renderizar los códigos QR', async () => {
        renderizar();

        expect(await screen.findByRole('heading', { name: 'Festival universitario' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Feria cultural' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Todas (2)' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Activas (1)' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Canceladas (1)' })).toBeInTheDocument();
        expect(screen.queryByText(/NO-RENDERIZAR/)).not.toBeInTheDocument();
        expect(screen.queryByText(/TAMPOCO-RENDERIZAR/)).not.toBeInTheDocument();
    });

    it('filtra las inscripciones según el estado', async () => {
        const user = userEvent.setup();
        renderizar();

        await screen.findByRole('heading', { name: 'Festival universitario' });
        await user.click(screen.getByRole('button', { name: 'Canceladas (1)' }));

        expect(screen.getByRole('heading', { name: 'Feria cultural' })).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Festival universitario' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Cancelar inscripción a Feria cultural' })).not.toBeInTheDocument();
    });

    it('muestra el botón de cancelar solo como presentación', async () => {
        renderizar();

        const botonDePresentacion = await screen.findByText('Cancelar', { selector: 'span' });
        expect(botonDePresentacion).toHaveClass('evento-row-button', 'evento-row-button--danger');
        expect(botonDePresentacion).toHaveAttribute('aria-hidden', 'true');
        expect(screen.queryByRole('button', { name: /Cancelar inscripción/ })).not.toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('muestra un estado vacío cuando no hay inscripciones', async () => {
        listarMock.mockResolvedValue([]);
        renderizar();

        expect(await screen.findByText('Aún no tienes inscripciones a eventos.')).toBeInTheDocument();
        await waitFor(() => expect(listarMock).toHaveBeenCalledOnce());
    });
});
