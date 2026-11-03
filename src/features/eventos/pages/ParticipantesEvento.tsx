import { Search, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { IconoAviso } from '../../../components/ui/IconoAviso';
import { Skeleton, SkeletonEstado } from '../../../components/ui/Skeleton';
import { useParticipantesEvento } from '../../../hooks/eventos/useParticipantesEvento';
import type { InscritoEvento } from '../../../types/evento';
import '../../../styles/event-participants.css';

const formatoFecha = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
});
const formatoHora = new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
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

export function ParticipantesEvento() {
    const { id } = useParams();
    const consulta = useParticipantesEvento(Number(id));
    const [busqueda, setBusqueda] = useState('');
    const inscritosVisibles = consulta.inscritos.filter((inscrito) =>
        coincideBusqueda(inscrito, busqueda),
    );

    return (
        <main className="participantes-page">
            <Link to="/organizador/eventos" className="participantes-volver">
                ← Volver a eventos
            </Link>

            {consulta.cargando && (
                <SkeletonEstado etiqueta="Cargando inscritos del evento">
                    <Skeleton className="mt-4 h-7 w-56" />
                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
                        <Skeleton className="h-14 w-full" />
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
                        <div>
                            <h1 className="participantes-titulo">Participantes inscritos</h1>
                            <p className="participantes-evento">{consulta.evento.titulo}</p>
                        </div>
                        <label className="participantes-busqueda">
                            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span className="sr-only">Buscar por nombre o correo</span>
                            <input
                                type="search"
                                value={busqueda}
                                onChange={(evento) => setBusqueda(evento.target.value)}
                                placeholder="Buscar por nombre o correo..."
                            />
                        </label>
                    </header>

                    <section className="participantes-resumen" aria-label="Resumen de cupos">
                        <div className="participantes-metrica">
                            <strong>{consulta.inscritos.length}</strong>
                            <span>Inscritos</span>
                        </div>
                        <div className="participantes-metrica">
                            <strong>{consulta.evento.cuposMaximos}</strong>
                            <span>Cupo total</span>
                        </div>
                        <div className="participantes-metrica">
                            <strong>{consulta.evento.cuposDisponibles}</strong>
                            <span>Cupos disponibles</span>
                        </div>
                    </section>

                    {consulta.inscritos.length === 0 ? (
                        <p className="participantes-vacio">
                            <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
                            Este evento aún no tiene inscripciones activas.
                        </p>
                    ) : inscritosVisibles.length === 0 ? (
                        <p className="participantes-vacio" role="status">
                            No se encontraron participantes con ese nombre o correo.
                        </p>
                    ) : (
                        <div className="participantes-tabla-contenedor">
                            <table className="participantes-tabla">
                                <thead>
                                    <tr>
                                        <th scope="col">Usuario</th>
                                        <th scope="col">Correo</th>
                                        <th scope="col">Fecha de inscripción</th>
                                        <th scope="col">Asistencia</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inscritosVisibles.map((inscrito) => {
                                        const fecha = new Date(inscrito.fechaInscripcion);
                                        return (
                                            <tr key={inscrito.inscripcionId}>
                                                <td>{inscrito.nombre}</td>
                                                <td>{inscrito.correo}</td>
                                                <td>
                                                    <time dateTime={inscrito.fechaInscripcion}>
                                                        {formatoFecha.format(fecha)}, {formatoHora.format(fecha)}
                                                    </time>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`participantes-asistencia${inscrito.asistio ? ' participantes-asistencia--asistio' : ' participantes-asistencia--pendiente'}`}
                                                    >
                                                        {inscrito.asistio ? 'Asistió' : 'Pendiente'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </main>
    );
}
