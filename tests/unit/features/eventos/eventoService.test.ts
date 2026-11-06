import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axiosClient } from '../../../../src/api';
import { guardarSesion } from '../../../../src/features/sesion/sesion';
import {
    cancelarEvento,
    crearEvento,
    descargarReporteEvento,
    editarEvento,
    listarEventos,
    listarInscritosEvento,
    listarMisEventos,
    obtenerEvento,
} from '../../../../src/features/eventos/services/eventoService';

vi.mock('../../../../src/api', () => ({
    axiosClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn() },
}));

const clienteMock = vi.mocked(axiosClient);

describe('eventoService', () => {
    beforeEach(() => {
        localStorage.clear();
        clienteMock.get.mockReset();
        clienteMock.post.mockReset();
        clienteMock.put.mockReset();
        clienteMock.patch.mockReset();
    });

    it('lista los eventos publicados', async () => {
        clienteMock.get.mockResolvedValue({ data: [{ id: 1 }] });

        const resultado = await listarEventos();

        expect(clienteMock.get).toHaveBeenCalledWith('/eventos');
        expect(resultado).toEqual([{ id: 1 }]);
    });

    it('usa el endpoint de catálogo incluso con una sesión de organizador', async () => {
        guardarSesion({
            token: 't',
            usuarioId: 2,
            nombre: 'Ana',
            correo: 'ana@unillanos.edu.co',
            rol: 'ORGANIZADOR',
        });
        clienteMock.get.mockResolvedValue({ data: [] });

        await listarEventos();

        expect(clienteMock.get).toHaveBeenCalledWith('/eventos');
    });

    it('rechaza una respuesta que no es una lista', async () => {
        clienteMock.get.mockResolvedValue({ data: '<!doctype html>' });

        await expect(listarEventos()).rejects.toThrow('no es una lista');
    });

    it('envía los filtros definidos al backend', async () => {
        clienteMock.get.mockResolvedValue({ data: [] });

        await listarEventos({
            categoriaId: 4,
            fechaDesde: '2026-10-01',
            fechaHasta: '2026-10-31',
            texto: 'feria',
        });

        expect(clienteMock.get).toHaveBeenCalledWith('/eventos', {
            params: {
                categoriaId: 4,
                fechaDesde: '2026-10-01',
                fechaHasta: '2026-10-31',
                texto: 'feria',
            },
        });
    });

    it('mantiene el estado como filtro local y no lo envía al backend', async () => {
        clienteMock.get.mockResolvedValue({ data: [] });

        await listarMisEventos({ estado: 'CANCELADO', categoriaId: 4 });

        expect(clienteMock.get).toHaveBeenCalledWith('/eventos/mios', { params: { categoriaId: 4 } });
    });

    it('lista los eventos propios del organizador mediante el endpoint específico', async () => {
        clienteMock.get.mockResolvedValue({ data: [{ id: 2 }] });

        await listarMisEventos({ texto: '  feria  ' });

        expect(clienteMock.get).toHaveBeenCalledWith('/eventos/mios', {
            params: { texto: 'feria' },
        });
    });

    it('omite filtros vacíos y conserva la llamada original sin parámetros', async () => {
        clienteMock.get.mockResolvedValue({ data: [] });

        await listarEventos({ texto: '   ', fechaDesde: undefined });

        expect(clienteMock.get).toHaveBeenCalledWith('/eventos');
    });

    it('consulta un evento por id', async () => {
        const detalle = { id: 7, titulo: 'Feria' };
        clienteMock.get.mockResolvedValue({ data: detalle });

        await expect(obtenerEvento(7)).resolves.toEqual(detalle);

        expect(clienteMock.get).toHaveBeenCalledWith('/eventos/7');
    });

    it('rechaza una respuesta de detalle que no es un objeto', async () => {
        clienteMock.get.mockResolvedValue({ data: [] });

        await expect(obtenerEvento(7)).rejects.toThrow('no es un evento válido');
    });

    it('consulta y valida los inscritos activos de un evento', async () => {
        const inscritos = [
            {
                inscripcionId: 31,
                usuarioId: 9,
                nombre: 'Laura Gómez',
                correo: 'laura@unillanos.edu.co',
                fechaInscripcion: '2026-09-10T14:20:00',
                asistio: true,
            },
        ];
        clienteMock.get.mockResolvedValue({ data: inscritos });

        await expect(listarInscritosEvento(7)).resolves.toEqual(inscritos);

        expect(clienteMock.get).toHaveBeenCalledWith('/eventos/7/inscritos');
    });

    it('rechaza una respuesta inválida del endpoint de inscritos', async () => {
        clienteMock.get.mockResolvedValue({ data: [{ nombre: 'Laura' }] });

        await expect(listarInscritosEvento(7)).rejects.toThrow(
            'La respuesta de /eventos/7/inscritos no es una lista válida de inscritos.',
        );
    });

    it('crea el evento sin enviar el id del organizador (va en el token)', async () => {
        clienteMock.post.mockResolvedValue({ data: { mensaje: 'Evento creado exitosamente.', eventoId: 7 } });
        const solicitud = {
            titulo: 'Feria',
            descripcion: 'Descripción',
            fechaInicio: '2026-10-20T14:30',
            ubicacion: 'Auditorio',
            cuposMaximos: 50,
            categoriaId: 2,
        };

        const resultado = await crearEvento(solicitud);

        expect(clienteMock.post).toHaveBeenCalledWith('/eventos', solicitud);
        expect(resultado.eventoId).toBe(7);
    });

    it('edita por id enviando solo los campos recibidos', async () => {
        clienteMock.put.mockResolvedValue({ data: { mensaje: 'Evento actualizado exitosamente.', eventoId: 7 } });

        await editarEvento(7, { cuposMaximos: 80 });

        expect(clienteMock.put).toHaveBeenCalledWith('/eventos/7', { cuposMaximos: 80 });
    });

    it('cancela el evento por id sin enviar un cuerpo', async () => {
        clienteMock.patch.mockResolvedValue({ data: { mensaje: 'Evento cancelado correctamente.', eventoId: 7 } });

        const resultado = await cancelarEvento(7);

        expect(clienteMock.patch).toHaveBeenCalledWith('/eventos/7/cancelar');
        expect(resultado.mensaje).toBe('Evento cancelado correctamente.');
    });

    it('descarga el reporte del evento como Blob', async () => {
        const pdf = new Blob(['%PDF-1.7'], { type: 'application/pdf' });
        clienteMock.get.mockResolvedValue({ data: pdf });

        const resultado = await descargarReporteEvento(7);

        expect(clienteMock.get).toHaveBeenCalledWith('/eventos/7/reporte', { responseType: 'blob' });
        expect(resultado).toBe(pdf);
    });

    it('convierte a JSON el error que llega como Blob para conservar el mensaje del backend', async () => {
        const cuerpo = new Blob([JSON.stringify({ error: 'No tienes permiso sobre este evento.' })], { type: 'application/json' });
        clienteMock.get.mockRejectedValue({ isAxiosError: true, response: { status: 403, data: cuerpo } });

        await expect(descargarReporteEvento(7)).rejects.toMatchObject({
            response: { data: { error: 'No tienes permiso sobre este evento.' } },
        });
    });
});
