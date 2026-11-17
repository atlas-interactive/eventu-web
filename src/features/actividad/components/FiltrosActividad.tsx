import { CalendarDays, ChevronDown, RotateCcw, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { FiltrosActividad, OpcionesFiltroActividad } from '../../../types/actividad';

const periodos = [
    { clave: 'actividad.hoy', dias: 1 },
    { clave: 'actividad.ultimos7', dias: 7 },
    { clave: 'actividad.ultimos30', dias: 30 },
] as const;

const fechaLocal = (fecha: Date) => {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
};

const rangoPeriodo = (dias: number) => {
    const hasta = new Date();
    const desde = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate());
    desde.setDate(desde.getDate() - dias + 1);
    return { fechaDesde: fechaLocal(desde), fechaHasta: fechaLocal(hasta) };
};

interface FiltrosActividadProps {
    filtros: FiltrosActividad;
    opciones: OpcionesFiltroActividad;
    cargandoOpciones: boolean;
    onChange: (filtros: FiltrosActividad) => void;
    onLimpiar: () => void;
}

export function FiltrosActividad({
    filtros,
    opciones,
    cargandoOpciones,
    onChange,
    onLimpiar,
}: FiltrosActividadProps) {
    const { t } = useTranslation();
    return (
        <section className="actividad-filtros" aria-label={t('actividad.filtrosAria')}>
            <div className="actividad-filtros-principales">
                <label className="actividad-campo" htmlFor="actividad-usuario">
                    <span>{t('actividad.usuario')}</span>
                    <span className="actividad-entrada-con-icono">
                        <Search aria-hidden="true" />
                        <input
                            id="actividad-usuario"
                            type="search"
                            placeholder={t('actividad.placeholderUsuario')}
                            value={filtros.usuario}
                            onChange={(evento) => onChange({ ...filtros, usuario: evento.target.value })}
                        />
                    </span>
                </label>
                <label className="actividad-campo" htmlFor="actividad-accion">
                    <span>{t('actividad.accion')}</span>
                    <span className="selector-con-chevron">
                        <select
                            id="actividad-accion"
                            value={filtros.accion}
                            disabled={cargandoOpciones}
                            onChange={(evento) => onChange({ ...filtros, accion: evento.target.value })}
                        >
                            <option value="">{t('actividad.todasAcciones')}</option>
                            {opciones.acciones.map((accion) => (
                                <option key={accion} value={accion}>
                                    {accion.replaceAll('_', ' ')}
                                </option>
                            ))}
                        </select>
                        <ChevronDown aria-hidden="true" />
                    </span>
                </label>
                <label className="actividad-campo" htmlFor="actividad-entidad">
                    <span>{t('actividad.entidad')}</span>
                    <span className="selector-con-chevron">
                        <select
                            id="actividad-entidad"
                            value={filtros.entidad}
                            disabled={cargandoOpciones}
                            onChange={(evento) => onChange({ ...filtros, entidad: evento.target.value })}
                        >
                            <option value="">{t('actividad.todas')}</option>
                            {opciones.entidades.map((entidad) => (
                                <option key={entidad} value={entidad}>
                                    {entidad}
                                </option>
                            ))}
                        </select>
                        <ChevronDown aria-hidden="true" />
                    </span>
                </label>
                <label className="actividad-campo" htmlFor="actividad-resultado">
                    <span>{t('actividad.resultado')}</span>
                    <span className="selector-con-chevron">
                        <select
                            id="actividad-resultado"
                            value={filtros.resultado}
                            disabled={cargandoOpciones}
                            onChange={(evento) => onChange({ ...filtros, resultado: evento.target.value })}
                        >
                            <option value="">{t('actividad.todosResultados')}</option>
                            {opciones.resultados.map((resultado) => (
                                <option key={resultado} value={resultado}>
                                    {resultado}
                                </option>
                            ))}
                        </select>
                        <ChevronDown aria-hidden="true" />
                    </span>
                </label>
            </div>

            <div className="actividad-filtros-fecha">
                <fieldset className="actividad-campo actividad-campo-fecha">
                    <legend>{t('actividad.fecha')}</legend>
                    <div className="actividad-rango-fechas">
                        <label>
                            <span className="sr-only">{t('actividad.desde')}</span>
                            <CalendarDays aria-hidden="true" />
                            <input
                                type="date"
                                aria-label={t('actividad.fechaDesdeAria')}
                                value={filtros.fechaDesde}
                                aria-invalid={Boolean(
                                    filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde > filtros.fechaHasta,
                                )}
                                onChange={(evento) => onChange({ ...filtros, fechaDesde: evento.target.value })}
                            />
                        </label>
                        <label>
                            <span className="sr-only">{t('actividad.hasta')}</span>
                            <CalendarDays aria-hidden="true" />
                            <input
                                type="date"
                                aria-label={t('actividad.fechaHastaAria')}
                                value={filtros.fechaHasta}
                                aria-invalid={Boolean(
                                    filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde > filtros.fechaHasta,
                                )}
                                onChange={(evento) => onChange({ ...filtros, fechaHasta: evento.target.value })}
                            />
                        </label>
                    </div>
                </fieldset>
                <div className="actividad-periodos" role="group" aria-label={t('actividad.periodosAria')}>
                    {periodos.map(({ clave, dias }) => {
                        const rango = rangoPeriodo(dias);
                        const activo = filtros.fechaDesde === rango.fechaDesde && filtros.fechaHasta === rango.fechaHasta;
                        return (
                            <button
                                type="button"
                                key={clave}
                                aria-pressed={activo}
                                className={activo ? 'actividad-periodo--activo' : undefined}
                                onClick={() => onChange({ ...filtros, ...rango })}
                            >
                                {t(clave)}
                            </button>
                        );
                    })}
                </div>
                <button
                    className="actividad-limpiar"
                    type="button"
                    onClick={onLimpiar}
                    disabled={!Object.values(filtros).some(Boolean)}
                >
                    <RotateCcw aria-hidden="true" />
                    {t('actividad.limpiar')}
                </button>
            </div>
        </section>
    );
}
