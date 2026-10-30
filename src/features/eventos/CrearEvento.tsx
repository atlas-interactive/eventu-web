import { useNavigate } from 'react-router-dom';
import { FormularioEvento } from './FormularioEvento';
import '../../styles/events.css';

// HU-05: el organizador crea un evento
export function CrearEvento() {
    const navigate = useNavigate();

    return (
        <main className="evento-page">
            <h1 className="evento-page-title">Crear evento</h1>
            <p className="evento-description">
                Completa los datos. El evento queda publicado con todos los cupos disponibles.
            </p>
            <FormularioEvento
                onGuardado={(mensaje) => navigate('/organizador/eventos', { state: { mensaje } })}
                onCancelar={() => navigate('/organizador/eventos')}
            />
        </main>
    );
}
