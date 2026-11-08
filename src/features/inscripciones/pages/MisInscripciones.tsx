import { IconoAviso } from '../../../components/ui/IconoAviso';
import { Skeleton, SkeletonEstado } from '../../../components/ui/Skeleton';
import { useMisInscripciones } from '../../../hooks/inscripciones/useMisInscripciones';
import type { FiltroInscripcion } from '../../../hooks/inscripciones/useMisInscripciones';
import { CalendarioInscripciones } from '../components/CalendarioInscripciones';
import { ConfirmarCancelacionInscripcion } from '../components/ConfirmarCancelacionInscripcion';
import '../../../styles/inscriptions.css';

const filtros: { valor: FiltroInscripcion; etiqueta: string }[] = [
    { valor: 'TODAS', etiqueta: 'Todas' },
    { valor: 'ACTIVA', etiqueta: 'Activas' },
    { valor: 'CANCELADA', etiqueta: 'Canceladas' },
];

export function MisInscripciones() {
    const misInscripciones = useMisInscripciones();

    return (
        <main className="inscripciones-page">
            <header className="inscripciones-header">
                <h1 className="inscripciones-titulo">Mis inscripciones</h1>
            </header>

            {misInscripciones.error && (
                <p role="alert" className="inscripciones-mensaje inscripciones-mensaje--error">
                    <IconoAviso tipo="error" className="h-4 w-4 shrink-0" />
                    {misInscripciones.error}
                </p>
            )}
            {misInscripciones.mensajeExito && (
                <p role="status" className="inscripciones-mensaje inscripciones-mensaje--exito">
                    <IconoAviso tipo="exito" className="h-4 w-4 shrink-0" />
                    {misInscripciones.mensajeExito}
                </p>
            )}

            <div className="inscripciones-filtros" role="group" aria-label="Filtrar inscripciones">
                {filtros.map(({ valor, etiqueta }) => (
                    <button
                        key={valor}
                        type="button"
                        className={`inscripciones-filtro${misInscripciones.filtro === valor ? ' inscripciones-filtro--activo' : ''}`}
                        aria-pressed={misInscripciones.filtro === valor}
                        onClick={() => misInscripciones.setFiltro(valor)}
                    >
                        {etiqueta} ({misInscripciones.conteos[valor]})
                    </button>
                ))}
            </div>

            {misInscripciones.cargando && (
                <SkeletonEstado etiqueta="Cargando tus inscripciones">
                    <ul className="inscripciones-lista">
                        {Array.from({ length: 3 }, (_, indice) => (
                            <li key={indice} className="inscripcion-fila" aria-hidden="true">
                                <div className="inscripcion-evento">
                                    <Skeleton className="h-5 w-52 max-w-full" />
                                    <Skeleton className="mt-2 h-4 w-40" />
                                </div>
                                <Skeleton className="h-8 w-28" />
                            </li>
                        ))}
                    </ul>
                </SkeletonEstado>
            )}

            {!misInscripciones.cargando && !misInscripciones.error && (
                <CalendarioInscripciones
                    inscripciones={misInscripciones.inscripciones}
                    onCancelar={misInscripciones.solicitarCancelacion}
                />
            )}
            {misInscripciones.aCancelar && (
                <ConfirmarCancelacionInscripcion
                    inscripcion={misInscripciones.aCancelar}
                    cancelando={misInscripciones.cancelando}
                    error={misInscripciones.errorCancelacion}
                    onCerrar={misInscripciones.cerrarConfirmacion}
                    onConfirmar={misInscripciones.confirmarCancelacion}
                />
            )}
        </main>
    );
}
