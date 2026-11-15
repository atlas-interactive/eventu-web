import { CalendarDays, RotateCcw, Search } from 'lucide-react';
import type { FiltrosActividad, OpcionesFiltroActividad } from '../../../types/actividad';

const periodos = [
    { etiqueta: 'Hoy', dias: 1 },
    { etiqueta: 'Últimos 7 días', dias: 7 },
    { etiqueta: 'Últimos 30 días', dias: 30 },
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
    return (
        <section className="actividad-filtros" aria-label="Filtros de actividad">
            <div className="actividad-filtros-principales">
                <label className="actividad-campo" htmlFor="actividad-usuario">
                    <span>Usuario</span>
                    <span className="actividad-entrada-con-icono">
                        <Search aria-hidden="true" />
                        <input
                            id="actividad-usuario"
                            type="search"
                            placeholder="Nombre o correo"
                            value={filtros.usuario}
                            onChange={(evento) => onChange({ ...filtros, usuario: evento.target.value })}
                        />
                    </span>
                </label>
                <label className="actividad-campo" htmlFor="actividad-accion">
                    <span>Acción</span>
                    <select
                        id="actividad-accion"
                        value={filtros.accion}
                        disabled={cargandoOpciones}
                        onChange={(evento) => onChange({ ...filtros, accion: evento.target.value })}
                    >
                        <option value="">Todas las acciones</option>
                        {opciones.acciones.map((accion) => (
                            <option key={accion} value={accion}>
                                {accion.replaceAll('_', ' ')}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="actividad-campo" htmlFor="actividad-entidad">
                    <span>Entidad</span>
                    <select
                        id="actividad-entidad"
                        value={filtros.entidad}
                        disabled={cargandoOpciones}
                        onChange={(evento) => onChange({ ...filtros, entidad: evento.target.value })}
                    >
                        <option value="">Todas</option>
                        {opciones.entidades.map((entidad) => (
                            <option key={entidad} value={entidad}>
                                {entidad}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="actividad-campo" htmlFor="actividad-resultado">
                    <span>Resultado</span>
                    <select
                        id="actividad-resultado"
                        value={filtros.resultado}
                        disabled={cargandoOpciones}
                        onChange={(evento) => onChange({ ...filtros, resultado: evento.target.value })}
                    >
                        <option value="">Todos los resultados</option>
                        {opciones.resultados.map((resultado) => (
                            <option key={resultado} value={resultado}>
                                {resultado}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="actividad-filtros-fecha">
                <div className="actividad-campo actividad-campo-fecha">
                    <span>Fecha</span>
                    <div className="actividad-rango-fechas">
                        <label>
                            <span className="sr-only">Desde</span>
                            <CalendarDays aria-hidden="true" />
                            <input
                                type="date"
                                aria-label="Fecha desde"
                                value={filtros.fechaDesde}
                                aria-invalid={Boolean(
                                    filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde > filtros.fechaHasta,
                                )}
                                onChange={(evento) => onChange({ ...filtros, fechaDesde: evento.target.value })}
                            />
                        </label>
                        <label>
                            <span className="sr-only">Hasta</span>
                            <CalendarDays aria-hidden="true" />
                            <input
                                type="date"
                                aria-label="Fecha hasta"
                                value={filtros.fechaHasta}
                                aria-invalid={Boolean(
                                    filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde > filtros.fechaHasta,
                                )}
                                onChange={(evento) => onChange({ ...filtros, fechaHasta: evento.target.value })}
                            />
                        </label>
                    </div>
                </div>
                <div className="actividad-periodos" role="group" aria-label="Periodos rápidos">
                    {periodos.map(({ etiqueta, dias }) => {
                        const rango = rangoPeriodo(dias);
                        const activo = filtros.fechaDesde === rango.fechaDesde && filtros.fechaHasta === rango.fechaHasta;
                        return (
                            <button
                                type="button"
                                key={etiqueta}
                                aria-pressed={activo}
                                className={activo ? 'actividad-periodo--activo' : undefined}
                                onClick={() => onChange({ ...filtros, ...rango })}
                            >
                                {etiqueta}
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
                    Limpiar filtros
                </button>
            </div>
        </section>
    );
}
