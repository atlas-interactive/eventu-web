import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Evento } from '../../types/evento';
import { FormularioEvento } from './FormularioEvento';
import { listarEventos } from './services/eventoService';
import '../../styles/events.css';

// HU-06: el organizador dueño (o un administrador) edita un evento publicado
export function EditarEvento() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [evento, setEvento] = useState<Evento | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Evita actualizar el estado si la respuesta llega después de desmontar la pantalla.
        let vigente = true;
        // No hay consulta por id en el backend: se busca en los eventos publicados (un evento cancelado no aparece)
        listarEventos()
            .then((eventos) => {
                if (!vigente) return;
                const encontrado = eventos.find((e) => String(e.id) === id);
                if (encontrado) setEvento(encontrado);
                else setError('No se encontró el evento, o ya no se puede editar.');
            })
            .catch((err: unknown) => {
                console.error('No se pudo cargar el evento:', err);
                if (vigente) setError('No se pudo cargar el evento. Intenta de nuevo más tarde.');
            })
            .finally(() => {
                if (vigente) setCargando(false);
            });
        return () => {
            vigente = false;
        };
    }, [id]);

    return (
        <main className="evento-page evento-page--edit">
            <h1 className="evento-page-title evento-page-title--edit">Editar evento</h1>
            {cargando && <p className="evento-list-state evento-loading">Cargando…</p>}
            {error && (
                <div className="evento-page-error-container">
                    <p role="alert" className="evento-page-error">
                        {error}
                    </p>
                    <Link to="/organizador/eventos" className="evento-back-link">
                        Volver a mis eventos
                    </Link>
                </div>
            )}
            {evento && (
                <div className="evento-form-wrap">
                    <FormularioEvento
                        evento={evento}
                        onGuardado={(mensaje) => navigate('/organizador/eventos', { state: { mensaje } })}
                        onCancelar={() => navigate('/organizador/eventos')}
                    />
                </div>
            )}
        </main>
    );
}
