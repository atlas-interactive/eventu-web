import { LockKeyhole } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    return (
        <section className="actividad-tabla-contenedor" aria-label={t('actividad.tablaAria')}>
            <table className="actividad-tabla">
                <caption className="sr-only">{t('actividad.tablaAria')}</caption>
                <thead className="actividad-tabla-encabezado">
                    <tr>
                        <th scope="col">{t('actividad.fechaHora')}</th>
                        <th scope="col">{t('actividad.usuario')}</th>
                        <th scope="col">{t('actividad.accion')}</th>
                        <th scope="col">{t('actividad.entidad')}</th>
                        <th scope="col">{t('actividad.resultado')}</th>
                        <th scope="col">{t('actividad.motivo')}</th>
                    </tr>
                </thead>
                <tbody>
                    {registros.map((registro) => {
                        return (
                            <tr
                                className={`actividad-tabla-fila${filtrosAplicados ? ' actividad-tabla-fila--filtrada' : ''}`}
                                key={registro.id}
                            >
                                <td data-label={t('actividad.fechaHora')}>
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
                                <td data-label={t('actividad.usuario')}>
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
                                        <span className="actividad-sin-usuario">{t('actividad.sinUsuario')}</span>
                                    )}
                                </td>
                                <td data-label={t('actividad.accion')}>
                                    <strong>{registro.accion.replaceAll('_', ' ')}</strong>
                                    <span className="actividad-codigo">{registro.accion}</span>
                                </td>
                                <td data-label={t('actividad.entidad')}>{mostrarEntidad(registro)}</td>
                                <td data-label={t('actividad.resultado')}>
                                    <span
                                        className={`actividad-resultado${registro.resultado.toUpperCase() === 'FALLIDO' ? ' actividad-resultado--fallido' : ' actividad-resultado--exitoso'}`}
                                    >
                                        {registro.resultado}
                                    </span>
                                </td>
                                <td data-label={t('actividad.motivo')}>{registro.motivo || '—'}</td>
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
                {t('actividad.soloLectura')}
            </p>
        </section>
    );
}
