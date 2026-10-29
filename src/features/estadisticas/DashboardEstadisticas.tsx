import { useEffect, useState, type ReactNode } from 'react';
import type { Estadisticas } from '../../types/estadisticas';
import { mensajeDeError } from '../eventos/mensajeDeError';
import { esAdministrador, obtenerSesion } from '../sesion/sesion';
import { GraficoBarras } from './GraficoBarras';
import { obtenerEstadisticas } from './services/estadisticaService';

const formatoNumero = new Intl.NumberFormat('es-CO');
const formatoPorcentaje = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });

interface TarjetaProps {
    titulo: string;
    valor: string;
    detalle: string;
    children?: ReactNode;
}

function Tarjeta({ titulo, valor, detalle, children }: TarjetaProps) {
    return (
        <div className="rounded-lg border border-eventu-border bg-eventu-white-surface p-4 sm:p-5">
            <dt className="text-sm text-eventu-secondary-text">{titulo}</dt>
            <dd className="mt-1 text-[2rem] font-semibold leading-tight text-eventu-main-ink">{valor}</dd>
            <dd className="mt-1 text-sm text-eventu-secondary-text">{detalle}</dd>
            {children}
        </div>
    );
}

// HU-16: el organizador ve los indicadores de sus eventos; el administrador, los de toda la plataforma y los rankings
export function DashboardEstadisticas() {
    const admin = esAdministrador(obtenerSesion());
    const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Evita actualizar el estado si la respuesta llega después de desmontar la pantalla.
        let vigente = true;
        obtenerEstadisticas()
            .then((datos) => {
                if (vigente) setEstadisticas(datos);
            })
            .catch((err: unknown) => {
                console.error('No se pudieron cargar las estadísticas:', err);
                if (vigente) setError(mensajeDeError(err));
            })
            .finally(() => {
                if (vigente) setCargando(false);
            });
        return () => {
            vigente = false;
        };
    }, []);

    const sinDatos = estadisticas !== null && estadisticas.inscripcionesActivas === 0 && estadisticas.asistentes === 0;
    const porcentaje = Math.min(100, Math.max(0, estadisticas?.porcentajeAsistencia ?? 0));

    return (
        <main className="mx-auto w-full max-w-[70rem] px-4 py-8 sm:px-8">
            <header className="mb-6">
                <h1 className="text-[1.375rem] font-semibold text-eventu-main-ink">Estadísticas</h1>
                <p className="mt-1 text-sm text-eventu-secondary-text">
                    {admin
                        ? 'Participación en todos los eventos de la plataforma.'
                        : 'Participación en los eventos que creaste.'}
                </p>
            </header>

            {cargando && (
                <p role="status" className="text-sm text-eventu-secondary-text">
                    Cargando estadísticas…
                </p>
            )}
            {error && (
                <p role="alert" className="text-sm text-eventu-error">
                    {error}
                </p>
            )}

            {estadisticas && (
                <>
                    {sinDatos && (
                        <p role="status" className="mb-4 rounded-md bg-eventu-soft-red-background px-4 py-3 text-sm text-eventu-main-ink">
                            {admin
                                ? 'Todavía no hay inscripciones en la plataforma.'
                                : 'Todavía no hay inscripciones en tus eventos. Los indicadores se actualizarán cuando alguien se inscriba.'}
                        </p>
                    )}

                    <dl className="grid gap-4 sm:grid-cols-3">
                        <Tarjeta
                            titulo="Inscripciones activas"
                            valor={formatoNumero.format(estadisticas.inscripcionesActivas)}
                            detalle="Personas con cupo reservado"
                        />
                        <Tarjeta
                            titulo="Asistentes"
                            valor={formatoNumero.format(estadisticas.asistentes)}
                            detalle="Asistencias registradas con el QR"
                        />
                        <Tarjeta
                            titulo="Porcentaje de asistencia"
                            valor={`${formatoPorcentaje.format(estadisticas.porcentajeAsistencia)} %`}
                            detalle="Asistentes sobre inscripciones activas"
                        >
                            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-eventu-border" aria-hidden="true">
                                <div className="h-full rounded-full bg-eventu-institutional-red" style={{ width: `${porcentaje}%` }} />
                            </div>
                        </Tarjeta>
                    </dl>

                    {admin && (
                        <div className="mt-6 grid gap-4 lg:grid-cols-2">
                            <GraficoBarras
                                titulo="Categorías más concurridas"
                                descripcion="Categorías con más inscripciones activas."
                                nombreValor="Inscripciones activas"
                                textoVacio="Todavía no hay inscripciones activas en ninguna categoría."
                                datos={estadisticas.categoriasMasConcurridas.map((c) => ({
                                    etiqueta: c.categoria,
                                    valor: c.inscripcionesActivas,
                                }))}
                            />
                            <GraficoBarras
                                titulo="Eventos con más inscritos"
                                descripcion="Eventos con más inscripciones activas."
                                nombreValor="Inscripciones activas"
                                textoVacio="Todavía no hay eventos con inscripciones activas."
                                datos={estadisticas.eventosConMasInscritos.map((e) => ({
                                    etiqueta: e.titulo,
                                    valor: e.inscripcionesActivas,
                                }))}
                            />
                        </div>
                    )}
                </>
            )}
        </main>
    );
}
