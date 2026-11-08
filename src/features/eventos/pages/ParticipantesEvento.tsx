import { useMemo, useState } from 'react';
import { CalendarDays, Check, Download, MapPin, Pencil, Search, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { guardarArchivo } from '../../../api/descargas';
import { mensajeDeError } from '../../../api/mensajeDeError';
import { IconoAviso } from '../../../components/ui/IconoAviso';
import { Skeleton, SkeletonEstado } from '../../../components/ui/Skeleton';
import { useParticipantesEvento } from '../../../hooks/eventos/useParticipantesEvento';
import { descargarReporteEvento } from '../services/eventoService';
import type { InscritoEvento } from '../../../types/evento';
import '../../../styles/event-participants.css';

type FiltroAsistencia = 'TODOS' | 'ASISTIERON' | 'PENDIENTES';

const formatoFecha = new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});
const formatoHora = new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
});

const normalizarTexto = (texto: string) =>
    texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-CO');

const coincideBusqueda = (inscrito: InscritoEvento, criterio: string) => {
    const busqueda = normalizarTexto(criterio.trim());
    return !busqueda ||
        normalizarTexto(inscrito.nombre).includes(busqueda) ||
        normalizarTexto(inscrito.correo).includes(busqueda);
};

const iniciales = (nombre: string) =>
    nombre.split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toLocaleUpperCase('es-CO');

export function ParticipantesEvento() {
    const { id } = useParams();
    const consulta = useParticipantesEvento(Number(id));
    const [busqueda, setBusqueda] = useState('');
    const [filtro, setFiltro] = useState<FiltroAsistencia>('TODOS');
    const [descargando, setDescargando] = useState(false);
    const [errorReporte, setErrorReporte] = useState('');
    const asistentes = consulta.inscritos.filter((inscrito) => inscrito.asistio).length;
    const pendientes = consulta.inscritos.length - asistentes;
    const inscritosVisibles = useMemo(
        () =>
            consulta.inscritos.filter((inscrito) => {
                const pasaEstado =
                    filtro === 'TODOS' ||
                    (filtro === 'ASISTIERON' ? inscrito.asistio : !inscrito.asistio);
                return pasaEstado && coincideBusqueda(inscrito, busqueda);
            }),
        [consulta.inscritos, filtro, busqueda],
    );

    const descargarReporte = async () => {
        if (!consulta.evento || descargando) return;
        setDescargando(true);
        setErrorReporte('');
        try {
            const pdf = await descargarReporteEvento(consulta.evento.id);
            guardarArchivo(pdf, `reporte-evento-${consulta.evento.id}.pdf`);
        } catch (err: unknown) {
            console.error('No se pudo descargar el reporte de inscritos:', err);
            setErrorReporte(mensajeDeError(err));
        } finally {
            setDescargando(false);
        }
    };

    return (
        <main className="participantes-page">
            <Link to="/organizador/eventos" className="participantes-volver">
                ← Mis eventos
            </Link>

            {consulta.cargando && (
                <SkeletonEstado etiqueta="Cargando inscritos del evento">
                    <Skeleton className="mt-4 h-7 w-56" />
                    <div className="mt-5 grid gap-4 sm:grid-cols-4">
                        {Array.from({ length: 4 }, (_, indice) => (
                            <Skeleton key={indice} className="h-20 w-full rounded-xl" />
                        ))}
                    </div>
                    <Skeleton className="mt-6 h-64 w-full rounded-xl" />
                </SkeletonEstado>
            )}

            {!consulta.cargando && consulta.error && (
                <p role="alert" className="participantes-error">
                    <IconoAviso tipo="error" className="h-4 w-4 shrink-0" />
                    {consulta.error}
                </p>
            )}

            {!consulta.cargando && !consulta.error && consulta.evento && (
                <>
                    <header className="participantes-header">
                        <div className="participantes-evento-identidad">
                            <h1 className="participantes-titulo">{consulta.evento.titulo}</h1>
                            <div className="participantes-evento-detalles">
                                <span>
                                    <CalendarDays aria-hidden="true" />
                                    {formatoFecha.format(new Date(consulta.evento.fechaInicio))},{' '}
                                    {formatoHora.format(new Date(consulta.evento.fechaInicio))}
                                </span>
                                <span><MapPin aria-hidden="true" />{consulta.evento.ubicacion}</span>
                                <span className="participantes-categoria">{consulta.evento.categoriaNombre}</span>
                            </div>
                        </div>
                        <div className="participantes-header-acciones">
                            <button
                                type="button"
                                className="participantes-accion"
                                onClick={descargarReporte}
                                disabled={descargando}
                                aria-busy={descargando}
                            >
                                <Download aria-hidden="true" />
                                {descargando ? 'Generando…' : 'Reporte PDF'}
                            </button>
                            <Link
                                to={`/organizador/eventos/${consulta.evento.id}/editar`}
                                className="participantes-accion"
                            >
                                <Pencil aria-hidden="true" />
                                Editar evento
                            </Link>
                        </div>
                    </header>

                    {errorReporte && (
                        <p role="alert" className="participantes-error">{errorReporte}</p>
                    )}

                    <section className="participantes-resumen" aria-label="Resumen del evento">
                        <div className="participantes-metrica">
                            <span>Inscritos</span>
                            <strong>{consulta.inscritos.length}<small> / {consulta.evento.cuposMaximos}</small></strong>
                        </div>
                        <div className="participantes-metrica">
                            <span>Cupos disponibles</span>
                            <strong>{consulta.evento.cuposDisponibles}<small> de {consulta.evento.cuposMaximos}</small></strong>
                        </div>
                        <div className="participantes-metrica participantes-metrica--asistieron">
                            <div><span>Asistieron</span><strong>{asistentes}</strong></div>
                            <div
                                className="participantes-progreso"
                                role="meter"
                                aria-label="Asistencias registradas"
                                aria-valuemin={0}
                                aria-valuemax={consulta.inscritos.length}
                                aria-valuenow={asistentes}
                            >
                                <span style={{ width: `${consulta.inscritos.length ? (asistentes / consulta.inscritos.length) * 100 : 0}%` }} />
                            </div>
                        </div>
                        <div className="participantes-metrica">
                            <span>Pendientes</span>
                            <strong>{pendientes}</strong>
                        </div>
                    </section>

                    {consulta.inscritos.length === 0 ? (
                        <p className="participantes-vacio">
                            <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
                            Este evento aún no tiene inscripciones activas.
                        </p>
                    ) : (
                        <section className="participantes-listado" aria-label="Participantes">
                            <div className="participantes-listado-controles">
                                <label className="participantes-busqueda">
                                    <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
                                    <span className="sr-only">Buscar por nombre o correo</span>
                                    <input
                                        type="search"
                                        value={busqueda}
                                        onChange={(evento) => setBusqueda(evento.target.value)}
                                        placeholder="Buscar por nombre o correo"
                                    />
                                </label>
                                <div className="participantes-filtros" role="group" aria-label="Filtrar por asistencia">
                                    {([
                                        ['TODOS', `Todos (${consulta.inscritos.length})`],
                                        ['ASISTIERON', `Asistieron (${asistentes})`],
                                        ['PENDIENTES', `Pendientes (${pendientes})`],
                                    ] as const).map(([valor, etiqueta]) => (
                                        <button
                                            key={valor}
                                            type="button"
                                            className={`participantes-filtro${filtro === valor ? ' participantes-filtro--activo' : ''}`}
                                            aria-pressed={filtro === valor}
                                            onClick={() => setFiltro(valor)}
                                        >
                                            {etiqueta}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {inscritosVisibles.length === 0 ? (
                                <p className="participantes-vacio" role="status">
                                    No se encontraron participantes con esos criterios.
                                </p>
                            ) : (
                                <>
                                    <div className="participantes-tabla-contenedor">
                                        <table className="participantes-tabla">
                                            <thead>
                                                <tr>
                                                    <th scope="col">Participante</th>
                                                    <th scope="col">Inscripción</th>
                                                    <th scope="col">Asistencia</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {inscritosVisibles.map((inscrito) => (
                                                    <tr key={inscrito.inscripcionId}>
                                                        <td>
                                                            <span className="participantes-persona">
                                                                <span className="participantes-avatar" aria-hidden="true">
                                                                    {iniciales(inscrito.nombre)}
                                                                </span>
                                                                <span>
                                                                    <strong>{inscrito.nombre}</strong>
                                                                    <small>{inscrito.correo}</small>
                                                                </span>
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <time dateTime={inscrito.fechaInscripcion}>
                                                                {formatoFecha.format(new Date(inscrito.fechaInscripcion))},{' '}
                                                                {formatoHora.format(new Date(inscrito.fechaInscripcion))}
                                                            </time>
                                                        </td>
                                                        <td>
                                                            <span className={`participantes-asistencia${inscrito.asistio ? ' participantes-asistencia--asistio' : ' participantes-asistencia--pendiente'}`}>
                                                                {inscrito.asistio && <Check aria-hidden="true" />}
                                                                {inscrito.asistio ? 'Asistió' : 'Pendiente'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <ul className="participantes-lista-movil">
                                        {inscritosVisibles.map((inscrito) => (
                                            <li key={inscrito.inscripcionId} className="participantes-movil-fila">
                                                <span className="participantes-avatar" aria-hidden="true">
                                                    {iniciales(inscrito.nombre)}
                                                </span>
                                                <span className="participantes-movil-identidad">
                                                    <strong>{inscrito.nombre}</strong>
                                                    <small>{inscrito.correo}</small>
                                                    <time dateTime={inscrito.fechaInscripcion}>
                                                        {formatoFecha.format(new Date(inscrito.fechaInscripcion))},{' '}
                                                        {formatoHora.format(new Date(inscrito.fechaInscripcion))}
                                                    </time>
                                                </span>
                                                <span className={`participantes-asistencia${inscrito.asistio ? ' participantes-asistencia--asistio' : ' participantes-asistencia--pendiente'}`}>
                                                    {inscrito.asistio ? 'Asistió' : 'Pendiente'}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </section>
                    )}
                </>
            )}
        </main>
    );
}
