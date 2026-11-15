import { useEffect, useState } from 'react';
import { CalendarCheck, ChartPie, Tags, Ticket, UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Estadisticas } from '../../types/estadisticas';
import { mensajeDeError } from '../../api/mensajeDeError';
import { Skeleton, SkeletonEstado } from '../../components/ui/Skeleton';
import { esAdministrador, obtenerSesion } from '../sesion/sesion';
import { GraficoAsistencia } from './components/GraficoAsistencia';
import { RankingBarras } from './components/RankingBarras';
import { TarjetaKpi } from './components/TarjetaKpi';
import { obtenerEstadisticas } from './services/estadisticaService';

const formatoNumero = new Intl.NumberFormat('es-CO');
const formatoPorcentaje = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });

// HU-16: el organizador ve los indicadores de sus eventos; el administrador, los de toda la plataforma y los rankings
export function DashboardEstadisticas() {
    const { t } = useTranslation();
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
                <h1 className="text-[1.375rem] font-semibold text-eventu-main-ink">{t('estadisticas.titulo')}</h1>
                <p className="mt-1 text-sm text-eventu-secondary-text">
                    {admin
                        ? t('estadisticas.descripcionAdmin')
                        : t('estadisticas.descripcionOrganizador')}
                </p>
            </header>

            {error && (
                <p role="alert" className="text-sm text-eventu-error">
                    {error}
                </p>
            )}

            {cargando && (
                <SkeletonEstado etiqueta={t('estadisticas.cargando')} className="space-y-4">
                    <div className="grid gap-4 lg:grid-cols-3">
                        <section className="rounded-xl border border-eventu-border bg-eventu-white-surface p-5 sm:p-6 lg:col-span-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="mt-2 h-4 w-64 max-w-full" />
                            <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
                                <Skeleton className="h-44 w-44 max-w-full shrink-0 rounded-full" />
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
                                ? t('estadisticas.sinDatosAdmin')
                                : t('estadisticas.sinDatosOrganizador')}
                        </p>
                    )}

                    <div className="grid gap-4 lg:grid-cols-3">
                        <section className="rounded-xl border border-eventu-border bg-eventu-white-surface p-5 sm:p-6 lg:col-span-2">
                            <h2 className="flex items-center gap-2 text-base font-semibold text-eventu-main-ink">
                                <ChartPie className="h-5 w-5 text-eventu-institutional-red" aria-hidden="true" />
                                {t('estadisticas.asistencia')}
                            </h2>
                            <p className="mb-5 mt-1 text-sm text-eventu-secondary-text">
                                {t('estadisticas.asistenciaDescripcion')}
                            </p>
                            <GraficoAsistencia
                                inscripciones={estadisticas.inscripcionesActivas}
                                asistentes={estadisticas.asistentes}
                                porcentaje={`${formatoPorcentaje.format(estadisticas.porcentajeAsistencia)} %`}
                            />
                        </section>

                        <section
                            aria-label={t('estadisticas.indicadoresAria')}
                            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"
                        >
                            <TarjetaKpi
                                titulo={t('estadisticas.inscripcionesActivas')}
                                valor={formatoNumero.format(estadisticas.inscripcionesActivas)}
                                detalle={t('estadisticas.cuposReservados')}
                                Icono={Ticket}
                                tono="rojo"
                            />
                            <TarjetaKpi
                                titulo={t('estadisticas.asistentes')}
                                valor={formatoNumero.format(estadisticas.asistentes)}
                                detalle={t('estadisticas.deInscritos', {
                                    cantidad: formatoNumero.format(estadisticas.inscripcionesActivas),
                                })}
                                Icono={UserCheck}
                                tono="verde"
                            />
                        </section>
                    </div>

                    {admin && (
                        <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
                            <RankingBarras
                                titulo={t('estadisticas.categoriasConcurridas')}
                                Icono={Tags}
                                descripcion={t('estadisticas.porInscripciones')}
                                unidad={t('estadisticas.unidadInscripciones')}
                                textoVacio={t('estadisticas.vacioCategorias')}
                                elementos={estadisticas.categoriasMasConcurridas.map((c) => ({
                                    clave: c.categoria,
                                    nombre: c.categoria,
                                    valor: c.inscripcionesActivas,
                                }))}
                            />
                            <RankingBarras
                                titulo={t('estadisticas.eventosMasInscritos')}
                                Icono={CalendarCheck}
                                descripcion={t('estadisticas.porInscripciones')}
                                unidad={t('estadisticas.unidadInscripciones')}
                                textoVacio={t('estadisticas.vacioEventos')}
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
