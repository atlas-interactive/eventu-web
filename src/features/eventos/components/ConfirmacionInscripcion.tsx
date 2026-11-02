import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Evento } from '../../../types/evento';

const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' });
const formatoHora = new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' });

interface ConfirmacionInscripcionProps {
    evento: Evento;
}

export function ConfirmacionInscripcion({ evento }: ConfirmacionInscripcionProps) {
    const fechaInicio = new Date(evento.fechaInicio);

    return (
        <main className="detalle-evento-page">
            <section
                className="detalle-evento-confirmacion"
                aria-labelledby="inscripcion-confirmada"
                aria-live="polite"
                role="status"
            >
                <div className="detalle-evento-confirmacion-icono" aria-hidden="true">
                    <Check className="h-6 w-6" />
                </div>
                <h1 id="inscripcion-confirmada" className="detalle-evento-confirmacion-titulo">
                    Inscripción realizada
                </h1>
                <p className="detalle-evento-confirmacion-mensaje">
                    Te has inscrito correctamente al evento.
                </p>
                <article className="detalle-evento-confirmacion-evento">
                    <h2>{evento.titulo}</h2>
                    <p>
                        <time dateTime={evento.fechaInicio}>
                            {formatoFecha.format(fechaInicio)}, {formatoHora.format(fechaInicio)}
                        </time>
                        {' · '}
                        {evento.ubicacion}
                    </p>
                </article>
                <Link to="/eventos" className="detalle-evento-confirmacion-volver">
                    Volver a eventos
                </Link>
            </section>
        </main>
    );
}
