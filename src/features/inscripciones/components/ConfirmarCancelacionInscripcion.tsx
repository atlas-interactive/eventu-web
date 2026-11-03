import { IconoAviso } from '../../../components/ui/IconoAviso';
import { ModalAccesible } from '../../../components/ui/ModalAccesible';
import type { Inscripcion } from '../../../types/inscripcion';

interface ConfirmarCancelacionInscripcionProps {
    inscripcion: Inscripcion;
    cancelando: boolean;
    error: string;
    onCerrar: () => void;
    onConfirmar: () => void;
}

export function ConfirmarCancelacionInscripcion({
    inscripcion,
    cancelando,
    error,
    onCerrar,
    onConfirmar,
}: ConfirmarCancelacionInscripcionProps) {
    return (
        <ModalAccesible
            titulo="¿Cancelar inscripción?"
            idTitulo="titulo-cancelar-inscripcion"
            onCerrar={onCerrar}
            icono={<span className="evento-dialog-icon">!</span>}
        >
            <h3 className="evento-dialog-title">{inscripcion.eventoTitulo}</h3>
            <p className="evento-dialog-copy">
                Se cancelará tu inscripción y el cupo quedará disponible para otra persona.
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
                    {cancelando ? 'Cancelando…' : 'Confirmar cancelación'}
                </button>
            </div>
        </ModalAccesible>
    );
}
