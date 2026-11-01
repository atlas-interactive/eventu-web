import type { Categoria } from '../../../types/categoria';
import type { FiltrosEvento } from '../../../types/evento';
import '../../../styles/event-filters.css';

interface FiltrosEventosProps {
    categorias: Categoria[];
    filtros: FiltrosEvento;
    onChange: (filtros: FiltrosEvento) => void;
}

export function FiltrosEventos({ categorias, filtros, onChange }: FiltrosEventosProps) {
    const cambiarCategoria = (categoriaId?: number) => onChange({ ...filtros, categoriaId });
    const fechasInvalidas = Boolean(
        filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde > filtros.fechaHasta,
    );

    return (
        <section className="filtros-eventos" aria-label="Buscar y filtrar eventos">
            <div className="filtros-eventos-categorias" aria-label="Filtrar por categoría">
                <button
                    type="button"
                    className={`filtros-eventos-categoria${filtros.categoriaId === undefined ? ' filtros-eventos-categoria--activa' : ''}`}
                    aria-pressed={filtros.categoriaId === undefined}
                    onClick={() => cambiarCategoria()}
                >
                    Todos
                </button>
                {categorias.map((categoria) => (
                    <button
                        key={categoria.id}
                        type="button"
                        className={`filtros-eventos-categoria${filtros.categoriaId === categoria.id ? ' filtros-eventos-categoria--activa' : ''}`}
                        aria-pressed={filtros.categoriaId === categoria.id}
                        onClick={() => cambiarCategoria(categoria.id)}
                    >
                        {categoria.nombre}
                    </button>
                ))}
            </div>

            <div className="filtros-eventos-campos">
                <label className="sr-only" htmlFor="buscar-eventos">Buscar eventos</label>
                <input
                    id="buscar-eventos"
                    className="filtros-eventos-input filtros-eventos-busqueda"
                    type="search"
                    maxLength={100}
                    placeholder="Buscar eventos..."
                    value={filtros.texto ?? ''}
                    onChange={(evento) => onChange({ ...filtros, texto: evento.target.value })}
                />
                <div className="filtros-eventos-fechas">
                    <label className="sr-only" htmlFor="eventos-fecha-desde">Desde</label>
                    <input
                        id="eventos-fecha-desde"
                        className="filtros-eventos-input"
                        type="date"
                        value={filtros.fechaDesde ?? ''}
                        max={filtros.fechaHasta}
                        aria-invalid={fechasInvalidas || undefined}
                        onChange={(evento) => onChange({ ...filtros, fechaDesde: evento.target.value || undefined })}
                    />
                    <label className="sr-only" htmlFor="eventos-fecha-hasta">Hasta</label>
                    <input
                        id="eventos-fecha-hasta"
                        className="filtros-eventos-input"
                        type="date"
                        value={filtros.fechaHasta ?? ''}
                        min={filtros.fechaDesde}
                        aria-invalid={fechasInvalidas || undefined}
                        onChange={(evento) => onChange({ ...filtros, fechaHasta: evento.target.value || undefined })}
                    />
                </div>
            </div>
            {fechasInvalidas && (
                <p className="filtros-eventos-error" role="alert">
                    La fecha inicial no puede ser posterior a la fecha final.
                </p>
            )}
        </section>
    );
}
