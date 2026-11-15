import { RotateCcw, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import type { Categoria } from '../../../types/categoria';
import type { FiltrosEvento } from '../../../types/evento';
import '../../../styles/event-results.css';
import type { OrdenEventos } from '../eventoOrdenamiento';
export type { OrdenEventos } from '../eventoOrdenamiento';

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
    PUBLICADO: 'resumen.publicados',
    CANCELADO: 'resumen.cancelados',
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

    if (desde) return i18n.t('resumen.desde', { fecha: formatoFecha.format(aFechaLocal(desde)) });
    if (hasta) return i18n.t('resumen.hasta', { fecha: formatoFecha.format(aFechaLocal(hasta)) });
    return '';
};

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
    const { t } = useTranslation();
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
            etiqueta: t(estados[estadoSeleccionado]),
            quitar: () => onChange({ ...filtros, estado: 'TODOS' }),
        });
    }
    if (filtros.categoriaId !== undefined) {
        filtrosActivos.push({
            id: 'categoria',
            etiqueta: categoria?.nombre ?? t('resumen.categoria'),
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
        <section className="eventos-resultados" aria-label={t('resumen.aria')}>
            <div className="eventos-resultados-filtros">
                <p className="eventos-resultados-cantidad" aria-live="polite">
                    <strong>{t('resumen.cantidad', { count: cantidadEventos })}</strong>
                    {filtrosActivos.length > 0 && <span> {t('resumen.coinciden')}</span>}
                </p>
                {filtrosActivos.map(({ id, etiqueta, quitar }) => (
                    <button
                        key={id}
                        type="button"
                        className="eventos-resultados-chip"
                        aria-label={t('resumen.quitarFiltro', { etiqueta })}
                        onClick={quitar}
                    >
                        {etiqueta}
                        <X aria-hidden="true" />
                    </button>
                ))}
                {filtrosActivos.length > 0 && (
                    <button type="button" className="eventos-resultados-limpiar" onClick={onLimpiar}>
                        <RotateCcw aria-hidden="true" />
                        {t('resumen.limpiar')}
                    </button>
                )}
            </div>
            <label className="eventos-resultados-orden">
                <span>{t('resumen.ordenar')}</span>
                <select
                    aria-label={t('resumen.ordenarAria')}
                    value={orden}
                    onChange={(evento) => {
                        const valor = evento.target.value;
                        if (valor === 'fecha-proxima' || valor === 'fecha-lejana' || valor === 'titulo') {
                            onOrdenChange(valor);
                        }
                    }}
                >
                    <option value="fecha-proxima">{t('resumen.fechaProxima')}</option>
                    <option value="fecha-lejana">{t('resumen.fechaLejana')}</option>
                    <option value="titulo">{t('resumen.tituloAZ')}</option>
                </select>
            </label>
        </section>
    );
}
