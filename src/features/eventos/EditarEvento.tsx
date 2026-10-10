import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Evento } from '../../types/evento';
import { FormularioEvento } from './FormularioEvento';
import { listarEventos } from './services/eventoService';

// HU-06: el organizador dueño (o un administrador) edita un evento publicado
export function EditarEvento() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [evento, setEvento] = useState<Evento | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
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
        <main className="mx-auto w-full max-w-[50rem] px-4 py-8 sm:px-8">
            <h1 className="text-[1.375rem] font-semibold text-eventu-main-ink">Editar evento</h1>
            {cargando && <p className="mt-4 text-sm text-eventu-secondary-text">Cargando…</p>}
            {error && (
                <div className="mt-4">
                    <p role="alert" className="text-sm text-eventu-error">
                        {error}
                    </p>
                    <Link to="/organizador/eventos" className="mt-2 inline-block text-sm text-eventu-institutional-red underline">
                        Volver a mis eventos
                    </Link>
                </div>
            )}
            {evento && (
                <div className="mt-6">
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
