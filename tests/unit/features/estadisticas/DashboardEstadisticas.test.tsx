import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardEstadisticas } from '../../../../src/features/estadisticas/DashboardEstadisticas';
import { obtenerEstadisticas } from '../../../../src/features/estadisticas/services/estadisticaService';
import { guardarSesion } from '../../../../src/features/sesion/sesion';
import type { Estadisticas } from '../../../../src/types/estadisticas';

vi.mock('../../../../src/features/estadisticas/services/estadisticaService', () => ({
    obtenerEstadisticas: vi.fn(),
}));

const obtenerEstadisticasMock = vi.mocked(obtenerEstadisticas);
const datos: Estadisticas = {
    inscripcionesActivas: 12,
    asistentes: 8,
    porcentajeAsistencia: 66.67,
    categoriasMasConcurridas: [{ categoria: 'Cultura', inscripcionesActivas: 7 }],
    eventosConMasInscritos: [{ eventoId: 3, titulo: 'Festival universitario', inscripcionesActivas: 12 }],
};

const iniciarSesionComo = (rol: string) => {
    guardarSesion({
        token: 'token-de-prueba',
        usuarioId: 1,
        nombre: 'Usuario de prueba',
        correo: 'prueba@unillanos.edu.co',
        rol,
    });
};

describe('DashboardEstadisticas', () => {
    beforeEach(() => {
        localStorage.clear();
        obtenerEstadisticasMock.mockReset();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('muestra la carga y luego los indicadores y rankings para un administrador', async () => {
        let resolver!: (respuesta: Estadisticas) => void;
        obtenerEstadisticasMock.mockReturnValue(
            new Promise<Estadisticas>((resolve) => {
                resolver = resolve;
            }),
        );
        iniciarSesionComo('ADMIN');

        render(<DashboardEstadisticas />);

        expect(screen.getByRole('status', { name: 'Cargando estadísticas' })).toHaveAttribute('aria-busy', 'true');

        await act(async () => resolver(datos));

        expect(await screen.findByText('Participación en todos los eventos de la plataforma.')).toBeInTheDocument();
        expect(screen.getByText(`${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(66.67)} %`))
            .toBeInTheDocument();
        expect(screen.getByText('Inscripciones activas')).toBeInTheDocument();
        expect(screen.getByText('Asistentes')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Categorías más concurridas' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Eventos con más inscritos' })).toBeInTheDocument();
        expect(screen.getByText('Festival universitario')).toBeInTheDocument();
    });

    it('presenta los indicadores del organizador sin mostrar los rankings globales', async () => {
        obtenerEstadisticasMock.mockResolvedValue(datos);
        iniciarSesionComo('ORGANIZADOR');

        render(<DashboardEstadisticas />);

        expect(await screen.findByText('Participación en los eventos que creaste.')).toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Categorías más concurridas' })).not.toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: 'Eventos con más inscritos' })).not.toBeInTheDocument();
        expect(obtenerEstadisticasMock).toHaveBeenCalledOnce();
    });

    it('comunica que todavía no hay inscripciones cuando las métricas están vacías', async () => {
        obtenerEstadisticasMock.mockResolvedValue({
            inscripcionesActivas: 0,
            asistentes: 0,
            porcentajeAsistencia: 0,
            categoriasMasConcurridas: [],
            eventosConMasInscritos: [],
        });
        iniciarSesionComo('ADMIN');

        render(<DashboardEstadisticas />);

        expect(await screen.findByText('Todavía no hay inscripciones en la plataforma.')).toBeInTheDocument();
        expect(screen.getByText('Todavía no hay inscripciones activas en ninguna categoría.')).toBeInTheDocument();
        expect(screen.getByText('Todavía no hay eventos con inscripciones activas.')).toBeInTheDocument();
    });

    it('muestra el error del servicio si no puede cargar las estadísticas', async () => {
        const error = new Error('Fallo de prueba');
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        obtenerEstadisticasMock.mockRejectedValue(error);
        iniciarSesionComo('ORGANIZADOR');

        render(<DashboardEstadisticas />);

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Ocurrió un error inesperado al conectar con el servidor.',
        );
        expect(consoleError).toHaveBeenCalledWith('No se pudieron cargar las estadísticas:', error);
    });
});
