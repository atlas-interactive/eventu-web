import { CalendarDays, RotateCcw, Search } from 'lucide-react';

const periodos = ['Hoy', 'Últimos 7 días', 'Últimos 30 días'];

export function FiltrosActividad() {
    return (
        <section className="actividad-filtros" aria-label="Filtros de actividad">
            <fieldset disabled>
                <legend className="sr-only">Filtros de actividad</legend>
                <div className="actividad-filtros-principales">
                    <label className="actividad-campo">
                        <span>Usuario</span>
                        <span className="actividad-entrada-con-icono">
                            <Search aria-hidden="true" />
                            <input type="search" placeholder="Nombre o correo" />
                        </span>
                    </label>
                    <label className="actividad-campo">
                        <span>Acción</span>
                        <select defaultValue="">
                            <option value="">Todas las acciones</option>
                        </select>
                    </label>
                    <label className="actividad-campo">
                        <span>Entidad</span>
                        <select defaultValue="">
                            <option value="">Todas</option>
                        </select>
                    </label>
                    <label className="actividad-campo">
                        <span>Resultado</span>
                        <select defaultValue="">
                            <option value="">Todos los resultados</option>
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
                                <input type="date" aria-label="Fecha desde" />
                            </label>
                            <label>
                                <span className="sr-only">Hasta</span>
                                <CalendarDays aria-hidden="true" />
                                <input type="date" aria-label="Fecha hasta" />
                            </label>
                        </div>
                    </div>
                    <div className="actividad-periodos" aria-label="Periodos rápidos">
                        {periodos.map((periodo) => (
                            <button type="button" key={periodo}>
                                {periodo}
                            </button>
                        ))}
                    </div>
                    <button className="actividad-limpiar" type="button">
                        <RotateCcw aria-hidden="true" />
                        Limpiar filtros
                    </button>
                </div>
            </fieldset>
            <p className="actividad-filtros-nota">Los filtros estarán disponibles al conectar la consulta de actividad.</p>
        </section>
    );
}
