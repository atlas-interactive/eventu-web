import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GestionEventos } from '../../../../src/features/eventos/pages/GestionEventos';
import {
    cancelarEvento,
    descargarReporteEvento,
    listarEventos,
    listarMisEventos,
} from '../../../../src/features/eventos/services/eventoService';
import { guardarArchivo } from '../../../../src/api/descargas';
import { guardarSesion } from '../../../../src/features/sesion/sesion';
import type { Evento } from '../../../../src/types/evento';
import { listarCategorias } from '../../../../src/features/categorias/services/categoriaService';

vi.mock('../../../../src/features/eventos/services/eventoService', () => ({
    cancelarEvento: vi.fn(),
    descargarReporteEvento: vi.fn(),
    listarEventos: vi.fn(),
    listarMisEventos: vi.fn(),
}));

vi.mock('../../../../src/features/categorias/services/categoriaService', () => ({
    listarCategorias: vi.fn(),
}));

vi.mock('../../../../src/api/descargas', () => ({
    guardarArchivo: vi.fn(),
}));

const cancelarMock = vi.mocked(cancelarEvento);
const descargarMock = vi.mocked(descargarReporteEvento);
const guardarMock = vi.mocked(guardarArchivo);
const listarTodosMock = vi.mocked(listarEventos);
const listarMisMock = vi.mocked(listarMisEventos);
const listarCategoriasMock = vi.mocked(listarCategorias);

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
            <GestionEventos />
        </MemoryRouter>,
    );

describe('GestionEventos (HU-07)', () => {
    beforeEach(() => {
        localStorage.clear();
        guardarSesion({
            token: 'token-prueba',
            usuarioId: 3,
            nombre: 'Laura',
            correo: 'laura@unillanos.edu.co',
            rol: 'ORGANIZADOR',
        });
        listarTodosMock.mockReset().mockResolvedValue([]);
        listarMisMock.mockReset().mockResolvedValue([evento(9, 'Feria cultural')]);
        listarCategoriasMock.mockReset().mockResolvedValue([
            { id: 2, nombre: 'Cultural', activo: true, creadoEn: '', eventosActivos: 1 },
        ]);
        cancelarMock.mockReset();
        descargarMock.mockReset();
        guardarMock.mockReset();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('carga los eventos propios del organizador desde su endpoint', async () => {
        listarMisMock.mockResolvedValue([evento(9, 'Feria cultural', 3)]);
        renderizar();

        expect(await screen.findByRole('heading', { name: 'Feria cultural' })).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Evento de otro organizador' })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Ver inscritos y asistencias de Feria cultural' })).toHaveAttribute(
            'href',
            '/organizador/eventos/9/inscritos',
        );
        expect(listarMisMock).toHaveBeenCalledWith({});
        expect(listarTodosMock).not.toHaveBeenCalled();
    });

    it('muestra todos los eventos y un título adecuado al administrador', async () => {
        guardarSesion({
            token: 'token-prueba',
            usuarioId: 1,
            nombre: 'Admin',
            correo: 'admin@unillanos.edu.co',
            rol: 'ADMIN',
        });
        listarTodosMock.mockResolvedValue([
            evento(9, 'Feria cultural', 3),
            evento(10, 'Evento de otro organizador', 8),
        ]);
        renderizar();

        expect(await screen.findByRole('heading', { name: 'Todos los eventos' })).toBeInTheDocument();
        expect(await screen.findByRole('heading', { name: 'Feria cultural' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Evento de otro organizador' })).toBeInTheDocument();
        expect(listarTodosMock).toHaveBeenCalledWith({});
        expect(listarMisMock).not.toHaveBeenCalled();
    });

    it('aplica filtros a la consulta sin cambiar las tarjetas de gestión', async () => {
        const usuario = userEvent.setup();
        renderizar();

        await screen.findByRole('heading', { name: 'Feria cultural' });
        expect(listarCategoriasMock).toHaveBeenCalledWith(true);
        await usuario.click(screen.getByRole('button', { name: 'Cultural' }));

        await vi.waitFor(() => expect(listarMisMock).toHaveBeenCalledTimes(2));
        expect(listarMisMock).toHaveBeenLastCalledWith({ categoriaId: 2 });
        expect(screen.getByRole('link', { name: 'Editar evento Feria cultural' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancelar evento Feria cultural' })).toBeInTheDocument();
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

describe('GestionEventos (HU-17)', () => {
    beforeEach(() => {
        localStorage.clear();
        guardarSesion({
            token: 'token-prueba',
            usuarioId: 3,
            nombre: 'Laura',
            correo: 'laura@unillanos.edu.co',
            rol: 'ORGANIZADOR',
        });
        listarTodosMock.mockReset().mockResolvedValue([]);
        listarMisMock.mockReset().mockResolvedValue([evento(9, 'Feria cultural')]);
        listarCategoriasMock.mockReset().mockResolvedValue([
            { id: 2, nombre: 'Cultural', activo: true, creadoEn: '', eventosActivos: 1 },
        ]);
        descargarMock.mockReset();
        guardarMock.mockReset();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('descarga el reporte PDF del evento con su nombre de archivo', async () => {
        const user = userEvent.setup();
        const pdf = new Blob(['%PDF-1.7'], { type: 'application/pdf' });
        descargarMock.mockResolvedValue(pdf);
        renderizar();

        await screen.findByRole('heading', { name: 'Feria cultural' });
        await user.click(screen.getByRole('button', { name: 'Descargar reporte de inscritos de Feria cultural' }));

        expect(descargarMock).toHaveBeenCalledWith(9);
        expect(guardarMock).toHaveBeenCalledWith(pdf, 'reporte-evento-9.pdf');
        expect(screen.getByRole('button', { name: 'Descargar reporte de inscritos de Feria cultural' })).toBeEnabled();
    });

    it('muestra el mensaje del backend si no se puede generar el reporte', async () => {
        const user = userEvent.setup();
        descargarMock.mockRejectedValue({ isAxiosError: true, response: { status: 409, data: { error: 'El evento no existe.' } } });
        const errorConsola = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        renderizar();

        await screen.findByRole('heading', { name: 'Feria cultural' });
        await user.click(screen.getByRole('button', { name: 'Descargar reporte de inscritos de Feria cultural' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('El evento no existe.');
        expect(guardarMock).not.toHaveBeenCalled();
        errorConsola.mockRestore();
    });

    it('no ofrece reporte para un evento cancelado', async () => {
        listarMisMock.mockResolvedValue([{ ...evento(9, 'Feria cultural'), estado: 'CANCELADO' }]);
        renderizar();

        await screen.findByRole('heading', { name: 'Feria cultural' });

        expect(screen.queryByRole('button', { name: /Descargar reporte/ })).not.toBeInTheDocument();
    });
});
