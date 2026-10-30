import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MisEventos } from '../../../../src/features/eventos/MisEventos';
import { cancelarEvento, listarEventos } from '../../../../src/features/eventos/services/eventoService';
import { guardarSesion } from '../../../../src/features/sesion/sesion';
import type { Evento } from '../../../../src/types/evento';

vi.mock('../../../../src/features/eventos/services/eventoService', () => ({
    cancelarEvento: vi.fn(),
    listarEventos: vi.fn(),
}));

const cancelarMock = vi.mocked(cancelarEvento);
const listarMock = vi.mocked(listarEventos);

const evento = (id: number, titulo: string, organizadorId = 3): Evento => ({
    id,
    titulo,
    descripcion: 'Descripción de prueba',
    fechaInicio: '2099-10-20T14:30:00',
    ubicacion: 'Auditorio',
    cuposMaximos: 50,
    cuposDisponibles: 30,
    estado: 'PUBLICADO',
    organizadorId,
    organizadorNombre: 'Laura',
    categoriaId: 2,
    categoriaNombre: 'Cultural',
});

const renderizar = () =>
    render(
        <MemoryRouter>
            <MisEventos />
        </MemoryRouter>,
    );

describe('MisEventos (HU-07)', () => {
    beforeEach(() => {
        localStorage.clear();
        guardarSesion({
            token: 'token-prueba',
            usuarioId: 3,
            nombre: 'Laura',
            correo: 'laura@unillanos.edu.co',
            rol: 'ORGANIZADOR',
        });
        listarMock.mockReset().mockResolvedValue([evento(9, 'Feria cultural')]);
        cancelarMock.mockReset();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('muestra solo los eventos del organizador', async () => {
        listarMock.mockResolvedValue([
            evento(9, 'Feria cultural', 3),
            evento(10, 'Evento de otro organizador', 8),
        ]);
        renderizar();

        expect(await screen.findByRole('heading', { name: 'Feria cultural' })).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Evento de otro organizador' })).not.toBeInTheDocument();
    });

    it('cancela el evento solo tras confirmar y lo retira de la lista', async () => {
        const user = userEvent.setup();
        cancelarMock.mockResolvedValue({ mensaje: 'Evento cancelado correctamente.', eventoId: 9 });
        renderizar();

        await screen.findByRole('heading', { name: 'Feria cultural' });
        await user.click(screen.getByRole('button', { name: 'Cancelar evento Feria cultural' }));

        const dialogo = screen.getByRole('dialog', { name: '¿Cancelar evento?' });
        expect(dialogo).toHaveTextContent('Se notificará por correo a los 20 usuarios inscritos');
        expect(cancelarMock).not.toHaveBeenCalled();

        await user.click(within(dialogo).getByRole('button', { name: 'Cancelar evento' }));

        expect(cancelarMock).toHaveBeenCalledWith(9);
        expect(await screen.findByRole('status')).toHaveTextContent('Evento cancelado correctamente.');
        expect(screen.queryByRole('heading', { name: 'Feria cultural' })).not.toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('conserva el diálogo y muestra el error si falla la cancelación', async () => {
        const user = userEvent.setup();
        cancelarMock.mockRejectedValue(new Error('Fallo de red'));
        const errorConsola = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        renderizar();

        await screen.findByRole('heading', { name: 'Feria cultural' });
        await user.click(screen.getByRole('button', { name: 'Cancelar evento Feria cultural' }));
        const dialogo = screen.getByRole('dialog', { name: '¿Cancelar evento?' });
        await user.click(within(dialogo).getByRole('button', { name: 'Cancelar evento' }));

        expect(await within(dialogo).findByRole('alert')).toHaveTextContent(
            'Ocurrió un error inesperado al conectar con el servidor.',
        );
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(within(screen.getByRole('list')).getByRole('heading', { name: 'Feria cultural' })).toBeInTheDocument();
        errorConsola.mockRestore();
    });
});
