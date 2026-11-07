import { RotateCcw, X } from 'lucide-react';
import type { Categoria } from '../../../types/categoria';
import type { Evento, FiltrosEvento } from '../../../types/evento';
import '../../../styles/event-results.css';

export type OrdenEventos = 'fecha-proxima' | 'fecha-lejana' | 'titulo';

interface ResumenEventosProps {
    cantidadEventos: number;
    categorias: Categoria[];
    filtros: FiltrosEvento;
    mostrarEstado?: boolean;
    orden: OrdenEventos;
    onChange: (filtros: FiltrosEvento) => void;
    onLimpiar: () => void;
    onOrdenChange: (orden: OrdenEventos) => void;
}

interface FiltroActivo {
    id: string;
    etiqueta: string;
    quitar: () => void;
}

const estados = {
    PUBLICADO: 'Publicados',
    CANCELADO: 'Cancelados',
} as const;

const formatoFecha = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' });

const aFechaLocal = (fecha: string): Date => {
    const [anio, mes, dia] = fecha.split('-').map(Number);
    return new Date(anio, mes - 1, dia);
};

const formatoRangoFechas = (desde?: string, hasta?: string): string => {
    if (desde && hasta) {
        const fechaDesde = aFechaLocal(desde);
        const fechaHasta = aFechaLocal(hasta);
        if (
            fechaDesde.getFullYear() === fechaHasta.getFullYear() &&
            fechaDesde.getMonth() === fechaHasta.getMonth()
        ) {
            return `${fechaDesde.getDate()}–${formatoFecha.format(fechaHasta)}`;
        }
        return `${formatoFecha.format(fechaDesde)} – ${formatoFecha.format(fechaHasta)}`;
    }

    if (desde) return `Desde ${formatoFecha.format(aFechaLocal(desde))}`;
    if (hasta) return `Hasta ${formatoFecha.format(aFechaLocal(hasta))}`;
    return '';
};

export const ordenarEventos = (eventos: Evento[], orden: OrdenEventos): Evento[] =>
    [...eventos].sort((a, b) => {
        if (orden === 'titulo') return a.titulo.localeCompare(b.titulo, 'es-CO');
        const diferencia = new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime();
        return orden === 'fecha-proxima' ? diferencia : -diferencia;
    });

export function ResumenEventos({
    cantidadEventos,
    categorias,
    filtros,
    mostrarEstado = false,
    orden,
    onChange,
    onLimpiar,
    onOrdenChange,
}: ResumenEventosProps) {
    const estadoSeleccionado = filtros.estado ?? (mostrarEstado ? 'PUBLICADO' : 'TODOS');
    const categoria = categorias.find(({ id }) => id === filtros.categoriaId);
    const filtrosActivos: FiltroActivo[] = [];

    if (filtros.texto?.trim()) {
        filtrosActivos.push({
            id: 'texto',
            etiqueta: `“${filtros.texto.trim()}”`,
            quitar: () => onChange({ ...filtros, texto: undefined }),
        });
    }
    if (mostrarEstado && estadoSeleccionado !== 'TODOS') {
        filtrosActivos.push({
            id: 'estado',
            etiqueta: estados[estadoSeleccionado],
            quitar: () => onChange({ ...filtros, estado: 'TODOS' }),
        });
    }
    if (filtros.categoriaId !== undefined) {
        filtrosActivos.push({
            id: 'categoria',
            etiqueta: categoria?.nombre ?? 'Categoría',
            quitar: () => onChange({ ...filtros, categoriaId: undefined }),
        });
    }
    if (filtros.fechaDesde || filtros.fechaHasta) {
        filtrosActivos.push({
            id: 'fecha',
            etiqueta: formatoRangoFechas(filtros.fechaDesde, filtros.fechaHasta),
            quitar: () => onChange({ ...filtros, fechaDesde: undefined, fechaHasta: undefined }),
        });
    }

    return (
        <section className="eventos-resultados" aria-label="Resumen y orden de eventos">
            <div className="eventos-resultados-filtros">
                <p className="eventos-resultados-cantidad" aria-live="polite">
                    <strong>{cantidadEventos} {cantidadEventos === 1 ? 'evento' : 'eventos'}</strong>
                    {filtrosActivos.length > 0 && <span> coinciden con</span>}
                </p>
                {filtrosActivos.map(({ id, etiqueta, quitar }) => (
                    <button
                        key={id}
                        type="button"
                        className="eventos-resultados-chip"
                        aria-label={`Quitar filtro: ${etiqueta}`}
                        onClick={quitar}
                    >
                        {etiqueta}
                        <X aria-hidden="true" />
                    </button>
                ))}
                {filtrosActivos.length > 0 && (
                    <button type="button" className="eventos-resultados-limpiar" onClick={onLimpiar}>
                        <RotateCcw aria-hidden="true" />
                        Limpiar filtros
                    </button>
                )}
            </div>
            <label className="eventos-resultados-orden">
                <span>Ordenar:</span>
                <select
                    aria-label="Ordenar eventos"
                    value={orden}
                    onChange={(evento) => {
                        const valor = evento.target.value;
                        if (valor === 'fecha-proxima' || valor === 'fecha-lejana' || valor === 'titulo') {
                            onOrdenChange(valor);
                        }
                    }}
                >
                    <option value="fecha-proxima">Fecha más próxima</option>
                    <option value="fecha-lejana">Fecha más lejana</option>
                    <option value="titulo">Título A–Z</option>
                </select>
            </label>
        </section>
    );
}
