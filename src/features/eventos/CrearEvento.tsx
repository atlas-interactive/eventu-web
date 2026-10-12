import { useNavigate } from 'react-router-dom';
import { FormularioEvento } from './FormularioEvento';

// HU-05: el organizador crea un evento
export function CrearEvento() {
    const navigate = useNavigate();

    return (
        <main className="mx-auto w-full max-w-[50rem] px-4 py-8 sm:px-8">
            <h1 className="text-[1.375rem] font-semibold text-eventu-main-ink">Crear evento</h1>
            <p className="mt-1 mb-6 text-sm text-eventu-secondary-text">
                Completa los datos. El evento queda publicado con todos los cupos disponibles.
            </p>
            <FormularioEvento
                onGuardado={(mensaje) => navigate('/organizador/eventos', { state: { mensaje } })}
                onCancelar={() => navigate('/organizador/eventos')}
            />
        </main>
    );
}
