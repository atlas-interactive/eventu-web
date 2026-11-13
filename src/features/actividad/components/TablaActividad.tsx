import { LockKeyhole } from 'lucide-react';
import type { RegistroActividadItem } from '../../../types/actividad';
import { formatearFechaHoraActividad, formatearTiempoRelativoActividad } from '../services/formatoFechaActividad';

interface TablaActividadProps {
    registros: RegistroActividadItem[];
    mensajeVacio: string;
    filtrosAplicados: boolean;
}

function mostrarEntidad(registro: RegistroActividadItem) {
    return registro.entidadId === null ? registro.entidad : `${registro.entidad} #${registro.entidadId}`;
}

export function TablaActividad({ registros, mensajeVacio, filtrosAplicados }: TablaActividadProps) {
    return (
        <section className="actividad-tabla-contenedor" aria-label="Registros de actividad">
            <table className="actividad-tabla">
                <thead className="actividad-tabla-encabezado">
                    <tr>
                        <th scope="col">Fecha y hora</th>
                        <th scope="col">Usuario</th>
                        <th scope="col">Acción</th>
                        <th scope="col">Entidad</th>
                        <th scope="col">Resultado</th>
                        <th scope="col">Motivo</th>
                    </tr>
                </thead>
                <tbody>
                    {registros.map((registro) => {
                        return (
                            <tr
                                className={`actividad-tabla-fila${filtrosAplicados ? ' actividad-tabla-fila--filtrada' : ''}`}
                                key={registro.id}
                            >
                                <td data-label="Fecha y hora">
                                    <time className="actividad-fecha" dateTime={registro.fecha}>
                                        {formatearTiempoRelativoActividad(registro.fecha)}
                                    </time>
                                    <time
                                        className="actividad-hora"
                                        dateTime={registro.fecha}
                                        title={formatearFechaHoraActividad(registro.fecha)}
                                    >
                                        {formatearFechaHoraActividad(registro.fecha)}
                                    </time>
                                </td>
                                <td data-label="Usuario">
                                    {registro.usuarioNombre ? (
                                        <span className="actividad-usuario">
                                            <span className="actividad-avatar" aria-hidden="true">
                                                {registro.usuarioNombre.slice(0, 1).toLocaleUpperCase('es-CO')}
                                            </span>
                                            <span>
                                                <strong>{registro.usuarioNombre}</strong>
                                                {registro.usuarioCorreo && <small>{registro.usuarioCorreo}</small>}
                                            </span>
                                        </span>
                                    ) : (
                                        <span className="actividad-sin-usuario">Sin usuario asociado</span>
                                    )}
                                </td>
                                <td data-label="Acción">
                                    <strong>{registro.accion.replaceAll('_', ' ')}</strong>
                                    <span className="actividad-codigo">{registro.accion}</span>
                                </td>
                                <td data-label="Entidad">{mostrarEntidad(registro)}</td>
                                <td data-label="Resultado">
                                    <span
                                        className={`actividad-resultado${registro.resultado.toUpperCase() === 'FALLIDO' ? ' actividad-resultado--fallido' : ' actividad-resultado--exitoso'}`}
                                    >
                                        {registro.resultado}
                                    </span>
                                </td>
                                <td data-label="Motivo">{registro.motivo || '—'}</td>
                            </tr>
                        );
                    })}
                    {registros.length === 0 && (
                        <tr className="actividad-tabla-fila--vacia">
                            <td className="actividad-vacio" colSpan={6}>
                                {mensajeVacio}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <p className="actividad-solo-lectura">
                <LockKeyhole aria-hidden="true" />
                Solo lectura: los registros no se pueden editar ni eliminar.
            </p>
        </section>
    );
}
