import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Evento } from '../../types/evento';
import { esAdministrador, obtenerSesion } from '../sesion/sesion';
import { listarEventos } from './services/eventoService';

const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

const botonPrimario =
    'inline-flex rounded-[0.4375rem] bg-eventu-institutional-red px-4 py-2 text-sm font-medium text-eventu-white-surface hover:bg-eventu-institutional-red-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red';
const botonFila =
    'inline-flex h-11 items-center justify-center rounded-[0.4375rem] border border-eventu-field-border bg-eventu-white-surface px-4 text-sm font-semibold text-eventu-main-ink hover:bg-eventu-page-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red';

// El organizador ve sus eventos publicados; el administrador ve todos (puede editar cualquiera)
export function MisEventos() {
    const location = useLocation();
    const mensajeExito = (location.state as { mensaje?: string } | null)?.mensaje ?? '';
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let vigente = true;
        const sesion = obtenerSesion();
        listarEventos()
            .then((datos) => {
                if (!vigente) return;
                setEventos(esAdministrador(sesion) ? datos : datos.filter((e) => e.organizadorId === sesion?.usuarioId));
            })
            .catch((err: unknown) => {
                console.error('No se pudo cargar el listado de eventos:', err);
                if (vigente) setError('No se pudieron cargar los eventos. Intenta de nuevo más tarde.');
            })
            .finally(() => {
                if (vigente) setCargando(false);
            });
        return () => {
            vigente = false;
        };
    }, []);

    return (
        <main className="mx-auto w-full max-w-[70rem] px-4 py-8 sm:px-8">
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-[1.375rem] font-semibold text-eventu-main-ink">Mis eventos</h1>
                    <p className="mt-1 text-sm text-eventu-secondary-text">Eventos publicados que puedes gestionar.</p>
                </div>
                <Link to="/organizador/eventos/nuevo" className={botonPrimario}>
                    Crear evento
                </Link>
            </header>

            {mensajeExito && (
                <p role="status" className="mb-4 rounded-md bg-eventu-green-background px-4 py-3 text-sm text-eventu-success">
                    {mensajeExito}
                </p>
            )}
            {error && (
                <p role="alert" className="mb-4 text-sm text-eventu-error">
                    {error}
                </p>
            )}
            {cargando && <p className="text-sm text-eventu-secondary-text">Cargando…</p>}
            {!cargando && !error && eventos.length === 0 && (
                <p className="text-sm text-eventu-secondary-text">Aún no tienes eventos publicados.</p>
            )}

            {eventos.length > 0 && (
                <ul className="space-y-3">
                    {eventos.map((evento) => (
                        <li
                            key={evento.id}
                            className="flex flex-col gap-3 rounded-lg border border-eventu-border bg-eventu-white-surface p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div>
                                <h2 className="text-base font-semibold text-eventu-main-ink">{evento.titulo}</h2>
                                <p className="text-sm text-eventu-secondary-text">
                                    {formatoFecha.format(new Date(evento.fechaInicio))} · {evento.ubicacion}
                                    {evento.categoriaNombre ? ` · ${evento.categoriaNombre}` : ''}
                                </p>
                                <p className="text-sm text-eventu-secondary-text">
                                    Cupos: {evento.cuposDisponibles} disponibles de {evento.cuposMaximos}
                                </p>
                            </div>
                            <Link
                                to={`/organizador/eventos/${evento.id}/editar`}
                                className={botonFila}
                                aria-label={`Editar evento ${evento.titulo}`}
                            >
                                Editar
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
