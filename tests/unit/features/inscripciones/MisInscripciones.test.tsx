import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { MisInscripciones } from '../../../../src/features/inscripciones/pages/MisInscripciones';
import {
    cancelarInscripcion,
    listarMisInscripciones,
} from '../../../../src/features/inscripciones/services/inscripcionService';
import { listarEventos } from '../../../../src/features/eventos/services/eventoService';
import type { Evento } from '../../../../src/types/evento';
import type { Inscripcion } from '../../../../src/types/inscripcion';

vi.mock('../../../../src/features/inscripciones/services/inscripcionService', () => ({
    listarMisInscripciones: vi.fn(),
    cancelarInscripcion: vi.fn(),
}));
vi.mock('../../../../src/features/eventos/services/eventoService', () => ({
    listarEventos: vi.fn(),
}));

const fechaDelMesActual = (dia: number, hora: string) => {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}T${hora}`;
};

const inscripciones: Inscripcion[] = [
    {
        id: 8,
        estado: 'ACTIVA',
        codigoQr: 'NO-RENDERIZAR-QR',
        fechaInscripcion: '2026-03-01T10:00:00',
        eventoId: 5,
        eventoTitulo: 'Festival universitario',
        eventoFechaInicio: fechaDelMesActual(4, '09:00:00'),
        eventoUbicacion: 'Campus',
    },
    {
        id: 9,
        estado: 'CANCELADA',
        codigoQr: 'TAMPOCO-RENDERIZAR',
        fechaInscripcion: '2026-03-02T10:00:00',
        eventoId: 6,
        eventoTitulo: 'Feria cultural',
        eventoFechaInicio: fechaDelMesActual(4, '14:30:00'),
        eventoUbicacion: 'Auditorio',
    },
];

const crearEvento = (id: number, estado = 'PUBLICADO'): Evento => ({
    id,
    titulo: `Evento ${id}`,
    descripcion: '',
    fechaInicio: '2026-04-02T09:00:00',
    ubicacion: 'Campus',
    cuposMaximos: 10,
    cuposDisponibles: 10,
    estado,
    organizadorId: 1,
    organizadorNombre: 'Organizador',
    categoriaId: 1,
    categoriaNombre: 'Cultura',
});

const listarMock = vi.mocked(listarMisInscripciones);
const cancelarMock = vi.mocked(cancelarInscripcion);
const listarEventosMock = vi.mocked(listarEventos);

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
        listarEventosMock.mockReset();
        listarMock.mockResolvedValue(inscripciones);
        listarEventosMock.mockResolvedValue(
            Array.from({ length: 8 }, (_, indice) =>
                crearEvento(indice + 5, indice === 7 ? 'CANCELADO' : 'PUBLICADO'),
            ),
        );
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

    it('solo muestra inscripciones de eventos publicados', async () => {
        listarMock.mockResolvedValue([
            ...inscripciones,
            {
                ...inscripciones[0],
                id: 12,
                eventoId: 12,
                eventoTitulo: 'Evento cancelado',
            },
        ]);
        listarEventosMock.mockResolvedValue([
            crearEvento(5),
            crearEvento(6),
            crearEvento(12, 'CANCELADO'),
        ]);
        renderizar();

        expect(await screen.findByRole('heading', { name: 'Festival universitario' })).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Evento cancelado' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Todas (2)' })).toBeInTheDocument();
    });

    it('muestra la agenda junto al calendario y permite seleccionar un día con varios eventos', async () => {
        const hoy = new Date();
        const fechaEvento = fechaDelMesActual(15, '09:00:00');
        listarMock.mockResolvedValue([
            ...inscripciones.slice(0, 1).map((inscripcion) => ({
                ...inscripcion,
                eventoFechaInicio: fechaEvento,
            })),
            {
                ...inscripciones[0],
                id: 10,
                eventoId: 7,
                eventoTitulo: 'Conferencia de tecnología',
                eventoFechaInicio: `${fechaEvento.slice(0, 11)}11:30:00`,
            },
            {
                ...inscripciones[0],
                id: 11,
                eventoId: 8,
                eventoTitulo: 'Taller de innovación',
                eventoFechaInicio: `${fechaEvento.slice(0, 11)}14:00:00`,
            },
        ]);
        const user = userEvent.setup();
        renderizar();

        await screen.findByRole('link', { name: /Taller de innovación/ });
        expect(screen.getByRole('heading', {
            name: new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(hoy),
        })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Taller de innovación/ })).toHaveAttribute(
            'href',
            '/eventos/8',
        );
        expect(screen.getByRole('link', { name: /Conferencia de tecnología/ })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Festival universitario/ })).toHaveAttribute(
            'href',
            '/eventos/5',
        );
        const diaCalendario = screen.getByRole('gridcell', { name: /15.*3 eventos/ });
        await user.click(diaCalendario);
        expect(diaCalendario).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByText('Eventos en el día seleccionado')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Taller de innovación/ })).toBeInTheDocument();
    });

    it('navega el calendario sin filtrar la agenda por mes', async () => {
        const hoy = new Date();
        const mesSiguiente = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
        const fechaEvento = `${mesSiguiente.getFullYear()}-${String(mesSiguiente.getMonth() + 1).padStart(2, '0')}-12T09:00:00`;
        listarMock.mockResolvedValue([
            {
                ...inscripciones[0],
                eventoTitulo: 'Próximo evento inscrito',
                eventoFechaInicio: fechaEvento,
            },
        ]);
        const user = userEvent.setup();
        renderizar();

        expect(await screen.findByRole('link', { name: 'Próximo evento inscrito' })).toBeInTheDocument();
        const nombreMesActual = new Intl.DateTimeFormat('es-CO', {
            month: 'long',
            year: 'numeric',
        }).format(hoy);
        await user.click(screen.getByRole('button', { name: 'Mes siguiente' }));
        expect(screen.getByRole('grid', {
            name: new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(mesSiguiente),
        })).toBeInTheDocument();
        expect(screen.queryByRole('grid', { name: nombreMesActual })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Próximo evento inscrito' })).toBeInTheDocument();
        expect(screen.queryByText('No tienes eventos este mes')).not.toBeInTheDocument();
    });

    it('mantiene calendario y agenda independiente al navegar por meses vacíos', async () => {
        listarMock.mockResolvedValue([]);
        const user = userEvent.setup();
        renderizar();

        expect(await screen.findByText('No tienes eventos publicados para mostrar')).toBeInTheDocument();
        expect(screen.getByRole('grid', { name: new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(new Date()) })).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Mes siguiente' }));
        expect(screen.getByRole('status')).toHaveTextContent('No tienes eventos publicados para mostrar');
        await user.click(screen.getByRole('button', { name: 'Hoy' }));
        expect(screen.getByRole('status')).toHaveTextContent('No tienes eventos publicados para mostrar');
        expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('permite abrir y descargar el QR desde la tarjeta de una inscripción activa', async () => {
        const user = userEvent.setup();
        renderizar();

        await user.click(await screen.findByRole('button', { name: 'Ver QR de Festival universitario' }));

        const dialog = screen.getByRole('dialog', { name: 'Tu entrada' });
        expect(within(dialog).getByText('Festival universitario')).toBeInTheDocument();
        expect(within(dialog).getByText('NO-RENDERIZAR-QR')).toBeInTheDocument();
        expect(within(dialog).getByRole('button', { name: 'Descargar entrada' })).toBeInTheDocument();
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
        expect(screen.getAllByText('Inscripción cancelada')).toHaveLength(2);
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
        expect(screen.getAllByText('Inscripción activa').length).toBeGreaterThan(0);
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

        expect(await screen.findByText('No tienes eventos publicados para mostrar')).toBeInTheDocument();
        await waitFor(() => expect(listarMock).toHaveBeenCalledOnce());
    });
});
