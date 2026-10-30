import { useEffect, useState } from 'react';
import type { Estadisticas } from '../../types/estadisticas';
import { mensajeDeError } from '../../api/mensajeDeError';
import { Skeleton, SkeletonEstado } from '../../components/ui/Skeleton';
import { esAdministrador, obtenerSesion } from '../sesion/sesion';
import { GraficoAsistencia } from './components/GraficoAsistencia';
import { RankingBarras } from './components/RankingBarras';
import { TarjetaKpi } from './components/TarjetaKpi';
import { IconoAsistente, IconoBoleta, IconoCalendario, IconoCategoria, IconoGrafico } from './components/iconos';
import { obtenerEstadisticas } from './services/estadisticaService';

const formatoNumero = new Intl.NumberFormat('es-CO');
const formatoPorcentaje = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });

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

            {error && (
                <p role="alert" className="text-sm text-eventu-error">
                    {error}
                </p>
            )}

            {cargando && (
                <SkeletonEstado etiqueta="Cargando estadísticas" className="space-y-4">
                    <div className="grid gap-4 lg:grid-cols-3">
                        <section className="rounded-xl border border-eventu-border bg-eventu-white-surface p-5 sm:p-6 lg:col-span-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="mt-2 h-4 w-64 max-w-full" />
                            <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
                                <Skeleton className="h-44 w-44 shrink-0 rounded-full" />
                                <div className="w-full max-w-xs space-y-4">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </div>
                        </section>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                            <Skeleton className="h-36 rounded-xl" />
                            <Skeleton className="h-36 rounded-xl" />
                        </div>
                    </div>
                    {admin && (
                        <div className="grid items-start gap-4 lg:grid-cols-2">
                            <Skeleton className="h-64 rounded-xl" />
                            <Skeleton className="h-64 rounded-xl" />
                        </div>
                    )}
                </SkeletonEstado>
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

                    <div className="grid gap-4 lg:grid-cols-3">
                        <section className="rounded-xl border border-eventu-border bg-eventu-white-surface p-5 sm:p-6 lg:col-span-2">
                            <h2 className="flex items-center gap-2 text-base font-semibold text-eventu-main-ink">
                                <IconoGrafico className="h-5 w-5 text-eventu-institutional-red" />
                                Asistencia
                            </h2>
                            <p className="mb-5 mt-1 text-sm text-eventu-secondary-text">
                                Asistentes registrados con el QR sobre las inscripciones activas.
                            </p>
                            <GraficoAsistencia
                                inscripciones={estadisticas.inscripcionesActivas}
                                asistentes={estadisticas.asistentes}
                                porcentaje={`${formatoPorcentaje.format(estadisticas.porcentajeAsistencia)} %`}
                            />
                        </section>

                        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                            <TarjetaKpi
                                titulo="Inscripciones activas"
                                valor={formatoNumero.format(estadisticas.inscripcionesActivas)}
                                detalle="Cupos reservados"
                                Icono={IconoBoleta}
                                tono="rojo"
                            />
                            <TarjetaKpi
                                titulo="Asistentes"
                                valor={formatoNumero.format(estadisticas.asistentes)}
                                detalle={`De ${formatoNumero.format(estadisticas.inscripcionesActivas)} inscritos`}
                                Icono={IconoAsistente}
                                tono="verde"
                            />
                        </dl>
                    </div>

                    {admin && (
                        <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
                            <RankingBarras
                                titulo="Categorías más concurridas"
                                Icono={IconoCategoria}
                                descripcion="Por número de inscripciones activas."
                                unidad="inscripciones activas"
                                textoVacio="Todavía no hay inscripciones activas en ninguna categoría."
                                elementos={estadisticas.categoriasMasConcurridas.map((c) => ({
                                    clave: c.categoria,
                                    nombre: c.categoria,
                                    valor: c.inscripcionesActivas,
                                }))}
                            />
                            <RankingBarras
                                titulo="Eventos con más inscritos"
                                Icono={IconoCalendario}
                                descripcion="Por número de inscripciones activas."
                                unidad="inscripciones activas"
                                textoVacio="Todavía no hay eventos con inscripciones activas."
                                elementos={estadisticas.eventosConMasInscritos.map((e) => ({
                                    clave: String(e.eventoId),
                                    nombre: e.titulo,
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
