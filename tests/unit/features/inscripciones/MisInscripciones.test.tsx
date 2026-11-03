import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { MisInscripciones } from '../../../../src/features/inscripciones/pages/MisInscripciones';
import {
    cancelarInscripcion,
    listarMisInscripciones,
} from '../../../../src/features/inscripciones/services/inscripcionService';
import type { Inscripcion } from '../../../../src/types/inscripcion';

vi.mock('../../../../src/features/inscripciones/services/inscripcionService', () => ({
    listarMisInscripciones: vi.fn(),
    cancelarInscripcion: vi.fn(),
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
const cancelarMock = vi.mocked(cancelarInscripcion);

const renderizar = () =>
    render(
        <MemoryRouter>
            <MisInscripciones />
        </MemoryRouter>,
    );

describe('MisInscripciones', () => {
    beforeEach(() => {
        listarMock.mockReset();
        cancelarMock.mockReset();
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
        expect(screen.getByRole('button', { name: 'Cancelar inscripción a Festival universitario' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Cancelar inscripción a Feria cultural' })).not.toBeInTheDocument();
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

    it('confirma la cancelación, actualiza el estado y deja de ofrecer cancelación', async () => {
        const user = userEvent.setup();
        cancelarMock.mockResolvedValue({
            mensaje: 'Inscripción cancelada exitosamente.',
            inscripcionId: 8,
        });
        renderizar();

        await user.click(await screen.findByRole('button', { name: 'Cancelar inscripción a Festival universitario' }));
        expect(screen.getByRole('dialog', { name: '¿Cancelar inscripción?' })).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Confirmar cancelación' }));

        expect(await screen.findByRole('status')).toHaveTextContent('Inscripción cancelada exitosamente.');
        expect(screen.getAllByText('Cancelada')).toHaveLength(2);
        expect(screen.getByRole('button', { name: 'Activas (0)' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Canceladas (2)' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Cancelar inscripción a Festival universitario' })).not.toBeInTheDocument();
        expect(cancelarMock).toHaveBeenCalledWith(8);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('conserva la inscripción y muestra el error backend si no se puede cancelar', async () => {
        const user = userEvent.setup();
        cancelarMock.mockRejectedValue({
            isAxiosError: true,
            response: { data: { error: 'No puedes cancelar tu inscripción porque ya asististe al evento.' } },
        });
        renderizar();

        await user.click(await screen.findByRole('button', { name: 'Cancelar inscripción a Festival universitario' }));
        await user.click(screen.getByRole('button', { name: 'Confirmar cancelación' }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'No puedes cancelar tu inscripción porque ya asististe al evento.',
        );
        expect(screen.getByText('Inscripción activa')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancelar inscripción a Festival universitario' })).toBeInTheDocument();
        expect(screen.getByRole('dialog', { name: '¿Cancelar inscripción?' })).toBeInTheDocument();
    });

    it('permite cerrar la confirmación sin cancelar', async () => {
        const user = userEvent.setup();
        renderizar();

        await user.click(await screen.findByRole('button', { name: 'Cancelar inscripción a Festival universitario' }));
        await user.click(screen.getByRole('button', { name: 'Volver' }));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(cancelarMock).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'Cancelar inscripción a Festival universitario' })).toBeInTheDocument();
    });

    it('evita solicitudes duplicadas mientras se cancela', async () => {
        const user = userEvent.setup();
        let completarCancelacion: (() => void) | undefined;
        cancelarMock.mockImplementation(
            () =>
                new Promise((resolve) => {
                    completarCancelacion = () =>
                        resolve({
                            mensaje: 'Inscripción cancelada exitosamente.',
                            inscripcionId: 8,
                        });
                }),
        );
        renderizar();

        await user.click(await screen.findByRole('button', { name: 'Cancelar inscripción a Festival universitario' }));
        await user.click(screen.getByRole('button', { name: 'Confirmar cancelación' }));

        expect(screen.getByRole('button', { name: 'Cancelando…' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Volver' })).toBeDisabled();
        expect(cancelarMock).toHaveBeenCalledOnce();

        completarCancelacion?.();
        expect(await screen.findByRole('status')).toHaveTextContent('Inscripción cancelada exitosamente.');
    });

    it('muestra un estado vacío cuando no hay inscripciones', async () => {
        listarMock.mockResolvedValue([]);
        renderizar();

        expect(await screen.findByText('Aún no tienes inscripciones a eventos.')).toBeInTheDocument();
        await waitFor(() => expect(listarMock).toHaveBeenCalledOnce());
    });
});
