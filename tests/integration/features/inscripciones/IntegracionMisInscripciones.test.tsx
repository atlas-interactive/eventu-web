import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { AppRoutes } from '../../../../src/routes/AppRoutes';
import { guardarSesion } from '../../../../src/features/sesion/sesion';
import { server } from '../../../mocks/server';
import type { Evento } from '../../../../src/types/evento';
import type { Inscripcion } from '../../../../src/types/inscripcion';

// Fecha de mañana en hora de Bogotá, para que las inscripciones sigan vigentes
const manana = (hora: string) => {
    const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date());
    const fecha = new Date(`${hoy}T00:00:00Z`);
    fecha.setUTCDate(fecha.getUTCDate() + 1);
    return `${fecha.toISOString().slice(0, 10)}T${hora}`;
};

let inscripciones: Inscripcion[];

const eventoPublicado = (id: number, titulo: string): Evento => ({
    id,
    titulo,
    descripcion: '',
    fechaInicio: manana('09:00:00'),
    ubicacion: 'Campus',
    cuposMaximos: 10,
    cuposDisponibles: 8,
    estado: 'PUBLICADO',
    certificable: false,
    organizadorId: 2,
    organizadorNombre: 'Organizador A',
    categoriaId: 1,
    categoriaNombre: 'Académico',
});

const usarBackendSimulado = () =>
    server.use(
        http.get('*/inscripciones/mias', () => HttpResponse.json(inscripciones)),
        http.get('*/eventos', () =>
            HttpResponse.json([eventoPublicado(5, 'Festival universitario'), eventoPublicado(6, 'Feria cultural')]),
        ),
        http.delete('*/inscripciones/:id', ({ params }) => {
            inscripciones = inscripciones.map((i) => (i.id === Number(params.id) ? { ...i, estado: 'CANCELADA', codigoQr: null } : i));
            return HttpResponse.json({ mensaje: 'Inscripción cancelada exitosamente.', inscripcionId: Number(params.id) });
        }),
    );

const abrir = () =>
    render(
        <MemoryRouter initialEntries={['/mis-inscripciones']}>
            <AppRoutes />
        </MemoryRouter>,
    );

// Más tiempo: la primera carga de las pantallas es lenta cuando se mide la cobertura
describe('Mis inscripciones (HU-11, HU-12, HU-14)', { timeout: 15000 }, () => {
    beforeEach(() => {
        localStorage.clear();
        inscripciones = [
            {
                id: 8,
                estado: 'ACTIVA',
                codigoQr: 'QR-FESTIVAL',
                fechaInscripcion: '2026-11-01T10:00:00',
                eventoId: 5,
                eventoTitulo: 'Festival universitario',
                eventoFechaInicio: manana('09:00:00'),
                eventoUbicacion: 'Campus',
            },
            {
                id: 9,
                estado: 'CANCELADA',
                codigoQr: null,
                fechaInscripcion: '2026-11-02T10:00:00',
                eventoId: 6,
                eventoTitulo: 'Feria cultural',
                eventoFechaInicio: manana('14:30:00'),
                eventoUbicacion: 'Auditorio',
            },
        ];
        guardarSesion({ token: 'token-est', usuarioId: 4, nombre: 'Estudiante Uno', correo: 'estudiante1@unillanos.edu.co', rol: 'USUARIO' });
        usarBackendSimulado();
    });

    it('lista las inscripciones y filtra las canceladas', async () => {
        const usuario = userEvent.setup({ delay: null });
        abrir();

        expect(await screen.findByRole('heading', { name: 'Festival universitario' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Activas (1)' })).toBeInTheDocument();

        await usuario.click(screen.getByRole('button', { name: 'Canceladas (1)' }));

        expect(screen.getByRole('heading', { name: 'Feria cultural' })).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Festival universitario' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Cancelar inscripción a Feria cultural' })).not.toBeInTheDocument();
    });

    it('muestra el QR de una inscripción activa', async () => {
        const usuario = userEvent.setup({ delay: null });
        abrir();

        await usuario.click(await screen.findByRole('button', { name: 'Ver QR de Festival universitario' }));

        const dialogo = await screen.findByRole('dialog', { name: 'Tu entrada' });
        expect(within(dialogo).getByText('QR-FESTIVAL')).toBeInTheDocument();
    });

    it('cancela una inscripción activa y deja de ofrecer la cancelación', async () => {
        const usuario = userEvent.setup({ delay: null });
        abrir();

        await usuario.click(await screen.findByRole('button', { name: 'Cancelar inscripción a Festival universitario' }));
        await usuario.click(screen.getByRole('button', { name: 'Confirmar cancelación' }));

        expect(await screen.findByText('Inscripción cancelada exitosamente.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Canceladas (2)' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Cancelar inscripción a Festival universitario' })).not.toBeInTheDocument();
    });
});
