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
    return (
        <ModalAccesible
            titulo="¿Cancelar evento?"
            idTitulo="titulo-cancelar-evento"
            onCerrar={onCerrar}
            icono={<span className="evento-dialog-icon">!</span>}
        >
            <h3 className="evento-dialog-title">{evento.titulo}</h3>
            <p className="evento-dialog-copy">
                Se notificará por correo a los {evento.cuposMaximos - evento.cuposDisponibles} usuarios inscritos, sus inscripciones
                pasaran a ser canceladas y ya no se podrán realizar nuevas inscripciones. Esta acciónn no elimina el registro histórico del evento.
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
                    Volver
                </button>
                <button
                    type="button"
                    className="workflow-button workflow-button--primary"
                    onClick={onConfirmar}
                    disabled={cancelando}
                >
                    {cancelando ? 'Cancelando…' : 'Cancelar evento'}
                </button>
            </div>
        </ModalAccesible>
    );
}
