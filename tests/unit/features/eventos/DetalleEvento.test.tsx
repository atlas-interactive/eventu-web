import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DetalleEvento } from '../../../../src/features/eventos/DetalleEvento';
import { obtenerEvento } from '../../../../src/features/eventos/services/eventoService';
import {
    inscribirEnEvento,
    obtenerInscripcionActiva,
} from '../../../../src/features/inscripciones/services/inscripcionService';
import { guardarSesion } from '../../../../src/features/sesion/sesion';
import type { Evento } from '../../../../src/types/evento';

vi.mock('../../../../src/features/eventos/services/eventoService', () => ({
    obtenerEvento: vi.fn(),
}));

vi.mock('../../../../src/features/inscripciones/services/inscripcionService', () => ({
    inscribirEnEvento: vi.fn(),
    obtenerInscripcionActiva: vi.fn(),
}));

const obtenerEventoMock = vi.mocked(obtenerEvento);
const inscribirEnEventoMock = vi.mocked(inscribirEnEvento);
const obtenerInscripcionActivaMock = vi.mocked(obtenerInscripcionActiva);

const evento: Evento = {
    id: 5,
    titulo: 'Feria de proyectos',
    descripcion: 'Espacio para la presentación de proyectos innovadores.',
    fechaInicio: '2099-09-12T09:00:00',
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
        inscribirEnEventoMock.mockReset().mockResolvedValue({
            mensaje: 'Inscripción realizada exitosamente.',
            inscripcionId: 12,
            codigoQr: 'EVENTU-QR-SECRETO',
        });
        obtenerInscripcionActivaMock.mockReset().mockResolvedValue(null);
        localStorage.clear();
        guardarSesion({
            token: 'token-prueba',
            usuarioId: 1,
            nombre: 'Ana',
            correo: 'ana@unillanos.edu.co',
            rol: 'USUARIO',
        });
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('consulta el evento y permite iniciar la inscripción', async () => {
        renderDetalle();

        expect(await screen.findByRole('heading', { name: 'Feria de proyectos' })).toBeInTheDocument();
        expect(obtenerEventoMock).toHaveBeenCalledWith(5);
        expect(screen.getByText('Espacio para la presentación de proyectos innovadores.')).toBeInTheDocument();
        expect(screen.getByText('38 de 120 disponibles')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Inscribirme al evento' })).toBeEnabled();
        expect(obtenerInscripcionActivaMock).toHaveBeenCalledWith(5);
    });

    it('muestra la entrada QR si ya existe una inscripción activa', async () => {
        obtenerInscripcionActivaMock.mockResolvedValue({
            id: 12,
            estado: 'ACTIVA',
            codigoQr: 'EVENTU-QR-ACTIVO',
            fechaInscripcion: '2026-09-10T14:20:00',
            eventoId: 5,
            eventoTitulo: evento.titulo,
            eventoFechaInicio: evento.fechaInicio,
            eventoUbicacion: evento.ubicacion,
        });
        renderDetalle();

        expect(await screen.findByText('EVENTU-QR-ACTIVO')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancelar mi inscripción' })).toBeInTheDocument();
        expect(inscribirEnEventoMock).not.toHaveBeenCalled();
    });

    it('no considera una inscripción cancelada como activa', async () => {
        obtenerInscripcionActivaMock.mockResolvedValue(null);
        renderDetalle();

        expect(await screen.findByRole('button', { name: 'Inscribirme al evento' })).toBeEnabled();
    });

    it('muestra el error de verificación y permite reintentar', async () => {
        const usuario = userEvent.setup();
        obtenerInscripcionActivaMock
            .mockRejectedValueOnce({
                isAxiosError: true,
                response: { data: { error: 'No se pudo consultar la inscripción.' } },
            })
            .mockResolvedValueOnce({
                id: 12,
                estado: 'ACTIVA',
                codigoQr: 'EVENTU-QR-ACTIVO',
                fechaInscripcion: '2026-09-10T14:20:00',
                eventoId: 5,
                eventoTitulo: evento.titulo,
                eventoFechaInicio: evento.fechaInicio,
                eventoUbicacion: evento.ubicacion,
            });
        const errorConsola = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        renderDetalle();

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'No se pudo verificar si ya estás inscrito: No se pudo consultar la inscripción.',
        );
        await usuario.click(screen.getByRole('button', { name: 'Reintentar verificación' }));

        expect(await screen.findByText('EVENTU-QR-ACTIVO')).toBeInTheDocument();
        errorConsola.mockRestore();
    });

    it('muestra la confirmación y el código QR después de inscribirse', async () => {
        const usuario = userEvent.setup();
        renderDetalle();

        await usuario.click(await screen.findByRole('button', { name: 'Inscribirme al evento' }));

        expect(inscribirEnEventoMock).toHaveBeenCalledWith(5);
        expect(await screen.findByRole('status')).toHaveTextContent(
            'Inscripción realizada: ya tienes una entrada para Feria de proyectos.',
        );
        expect(screen.getByRole('heading', { name: 'Feria de proyectos' })).toBeInTheDocument();
        expect(await screen.findByText('EVENTU-QR-SECRETO')).toBeInTheDocument();
        expect(screen.queryByText('Inscripción realizada exitosamente.')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Descargar entrada' })).toBeInTheDocument();
    });

    it('muestra el error del backend y permite volver a intentar', async () => {
        const usuario = userEvent.setup();
        inscribirEnEventoMock.mockRejectedValue({
            isAxiosError: true,
            response: { data: { error: 'Ya tienes una inscripción activa para este evento.' } },
        });
        const errorConsola = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        renderDetalle();

        await usuario.click(await screen.findByRole('button', { name: 'Inscribirme al evento' }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Ya tienes una inscripción activa para este evento.',
        );
        expect(screen.getByRole('button', { name: 'Inscribirme al evento' })).toBeEnabled();
        errorConsola.mockRestore();
    });

    it('permite al organizador inscribirse a eventos de otro organizador', async () => {
        const usuario = userEvent.setup();
        guardarSesion({
            token: 'token-prueba',
            usuarioId: 3,
            nombre: 'Laura',
            correo: 'laura@unillanos.edu.co',
            rol: 'ORGANIZADOR',
        });
        renderDetalle();

        await usuario.click(await screen.findByRole('button', { name: 'Inscribirme al evento' }));

        expect(inscribirEnEventoMock).toHaveBeenCalledWith(5);
    });

    it('no permite al organizador inscribirse a su propio evento', async () => {
        guardarSesion({
            token: 'token-prueba',
            usuarioId: evento.organizadorId,
            nombre: 'Laura',
            correo: 'laura@unillanos.edu.co',
            rol: 'ORGANIZADOR',
        });
        renderDetalle();

        expect(await screen.findByText('No puedes inscribirte en un evento que tú organizas.')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Inscribirme al evento' })).not.toBeInTheDocument();
        expect(inscribirEnEventoMock).not.toHaveBeenCalled();
    });

    it('no ofrece inscripción al administrador', async () => {
        guardarSesion({
            token: 'token-prueba',
            usuarioId: 4,
            nombre: 'Admin',
            correo: 'admin@unillanos.edu.co',
            rol: 'ADMIN',
        });
        renderDetalle();

        expect(await screen.findByText('Los administradores no pueden inscribirse en eventos.')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Inscribirme al evento' })).not.toBeInTheDocument();
        expect(obtenerInscripcionActivaMock).not.toHaveBeenCalled();
    });

    it('indica que no hay cupos disponibles cuando el evento está agotado', async () => {
        obtenerEventoMock.mockResolvedValue({ ...evento, cuposDisponibles: 0 });
        renderDetalle();

        expect(await screen.findAllByText('Cupos agotados')).toHaveLength(2);
        expect(screen.getByText('0 de 120 disponibles')).toBeInTheDocument();
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
