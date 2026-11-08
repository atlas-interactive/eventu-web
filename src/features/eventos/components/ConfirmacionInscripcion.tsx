import { Check } from 'lucide-react';
import type { Evento } from '../../../types/evento';

interface ConfirmacionInscripcionProps {
    evento: Evento;
}

export function ConfirmacionInscripcion({ evento }: ConfirmacionInscripcionProps) {
    return (
        <p className="detalle-evento-inscripcion-exito" role="status" aria-live="polite">
            <Check aria-hidden="true" />
            Inscripción realizada: ya tienes una entrada para {evento.titulo}.
        </p>
    );
}
