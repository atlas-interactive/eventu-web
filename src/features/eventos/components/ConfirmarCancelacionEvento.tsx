import { useTranslation } from 'react-i18next';
import { IconoAviso } from '../../../components/ui/IconoAviso';
import { ModalAccesible } from '../../../components/ui/ModalAccesible';
import type { Evento } from '../../../types/evento';

interface ConfirmarCancelacionEventoProps {
    evento: Evento;
    cancelando: boolean;
    error: string;
    onCerrar: () => void;
    onConfirmar: () => void;
}

export function ConfirmarCancelacionEvento({
    evento,
    cancelando,
    error,
    onCerrar,
    onConfirmar,
}: ConfirmarCancelacionEventoProps) {
    const { t } = useTranslation();
    return (
        <ModalAccesible
            titulo={t('cancelarEvento.titulo')}
            idTitulo="titulo-cancelar-evento"
            onCerrar={onCerrar}
            icono={<span className="evento-dialog-icon">!</span>}
        >
            <h3 className="evento-dialog-title">{evento.titulo}</h3>
            <p className="evento-dialog-copy">
                {t('cancelarEvento.mensaje', {
                    inscritos: evento.cuposMaximos - evento.cuposDisponibles,
                })}
            </p>
            {error && (
                <p role="alert" className="workflow-inline-error evento-dialog-error flex items-start gap-2">
                    <IconoAviso tipo="error" className="mt-0.5 h-4 w-4" />
                    {error}
                </p>
            )}
            <div className="workflow-dialog-actions">
                <button
                    type="button"
                    className="workflow-button workflow-button--secondary"
                    onClick={onCerrar}
                    disabled={cancelando}
                >
                    {t('cancelarEvento.volver')}
                </button>
                <button
                    type="button"
                    className="workflow-button workflow-button--primary"
                    onClick={onConfirmar}
                    disabled={cancelando}
                >
                    {cancelando ? t('cancelarEvento.cancelando') : t('cancelarEvento.confirmar')}
                </button>
            </div>
        </ModalAccesible>
    );
}
