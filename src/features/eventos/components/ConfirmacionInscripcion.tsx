import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Evento } from '../../../types/evento';

interface ConfirmacionInscripcionProps {
    evento: Evento;
}

export function ConfirmacionInscripcion({ evento }: ConfirmacionInscripcionProps) {
    const { t } = useTranslation();
    return (
        <p className="detalle-evento-inscripcion-exito" role="status" aria-live="polite">
            <Check aria-hidden="true" />
            {t('detalle.inscripcionRealizada', { titulo: evento.titulo })}
        </p>
    );
}
