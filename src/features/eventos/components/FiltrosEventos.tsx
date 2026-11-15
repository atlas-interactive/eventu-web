import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Categoria } from '../../../types/categoria';
import type { FiltrosEvento } from '../../../types/evento';
import { ModalAccesible } from '../../../components/ui/ModalAccesible';
import { ResumenEventos } from './ResumenEventos';
import type { OrdenEventos } from '../eventoOrdenamiento';
import '../../../styles/event-filters.css';

interface FiltrosEventosProps {
    categorias: Categoria[];
    cantidadEventos: number;
    filtros: FiltrosEvento;
    mostrarResumen: boolean;
    onChange: (filtros: FiltrosEvento) => void;
    onOrdenChange: (orden: OrdenEventos) => void;
    mostrarEstado?: boolean;
    orden: OrdenEventos;
}

const estados = [
    { valor: 'TODOS', clave: 'filtros.todos' },
    { valor: 'PUBLICADO', clave: 'filtros.publicados' },
    { valor: 'CANCELADO', clave: 'filtros.cancelados' },
] as const;

const periodos = [
    { valor: 'hoy', clave: 'filtros.hoy' },
    { valor: 'semana', clave: 'filtros.estaSemana' },
    { valor: 'mes', clave: 'filtros.esteMes' },
    { valor: 'proximo-mes', clave: 'filtros.proximoMes' },
] as const;

const aFechaLocal = (fecha: Date) => {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
};

const obtenerRangoPeriodo = (periodo: (typeof periodos)[number]['valor'], ahora = new Date()) => {
    const inicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    if (periodo === 'hoy') return { fechaDesde: aFechaLocal(inicio), fechaHasta: aFechaLocal(inicio) };

    if (periodo === 'semana') {
        const diasDesdeLunes = (inicio.getDay() + 6) % 7;
        const lunes = new Date(inicio);
        lunes.setDate(inicio.getDate() - diasDesdeLunes);
        const domingo = new Date(lunes);
        domingo.setDate(lunes.getDate() + 6);
        return { fechaDesde: aFechaLocal(lunes), fechaHasta: aFechaLocal(domingo) };
    }

    const mesObjetivo = periodo === 'mes' ? inicio.getMonth() : inicio.getMonth() + 1;
    const fechaDesde = new Date(inicio.getFullYear(), mesObjetivo, 1);
    const fechaHasta = new Date(inicio.getFullYear(), mesObjetivo + 1, 0);
    return { fechaDesde: aFechaLocal(fechaDesde), fechaHasta: aFechaLocal(fechaHasta) };
};

const mismoRango = (filtros: FiltrosEvento, rango: { fechaDesde: string; fechaHasta: string }) =>
    filtros.fechaDesde === rango.fechaDesde && filtros.fechaHasta === rango.fechaHasta;

export function FiltrosEventos({
    categorias,
    cantidadEventos,
    filtros,
    mostrarResumen,
    onChange,
    onOrdenChange,
    mostrarEstado = false,
    orden,
}: FiltrosEventosProps) {
    const { t } = useTranslation();
    const [panelMovilAbierto, setPanelMovilAbierto] = useState(false);
    const estadoSeleccionado = filtros.estado ?? (mostrarEstado ? 'PUBLICADO' : 'TODOS');
    const fechasInvalidas = Boolean(
        filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde > filtros.fechaHasta,
    );
    const filtrosActivos =
        Number(filtros.categoriaId !== undefined) +
        Number(Boolean(filtros.fechaDesde || filtros.fechaHasta)) +
        Number(estadoSeleccionado !== 'TODOS' && mostrarEstado);
    const hayFiltrosAplicados = Boolean(
        filtros.texto?.trim() ||
        filtros.categoriaId !== undefined ||
        filtros.fechaDesde ||
        filtros.fechaHasta ||
        (mostrarEstado && estadoSeleccionado === 'CANCELADO'),
    );

    const cambiarCategoria = (categoriaId?: number) => onChange({ ...filtros, categoriaId });
    const cambiarEstado = (estado: FiltrosEvento['estado']) => onChange({ ...filtros, estado });
    const cambiarPeriodo = (periodo: (typeof periodos)[number]['valor']) =>
        onChange({ ...filtros, ...obtenerRangoPeriodo(periodo) });
    const limpiarFiltros = () =>
        onChange({
            texto: undefined,
            categoriaId: undefined,
            fechaDesde: undefined,
            fechaHasta: undefined,
            estado: 'TODOS',
        });

    const renderEstado = () =>
        mostrarEstado && (
            <div className="filtros-eventos-grupo">
                <span className="filtros-eventos-etiqueta">{t('filtros.estado')}</span>
                <div className="filtros-eventos-estados" role="group" aria-label={t('filtros.filtrarPorEstado')}>
                    {estados.map(({ valor, clave }) => (
                        <button
                            key={valor}
                            type="button"
                            className={`filtros-eventos-estado${estadoSeleccionado === valor ? ' filtros-eventos-estado--activo' : ''}`}
                            aria-pressed={estadoSeleccionado === valor}
                            onClick={() => cambiarEstado(valor)}
                        >
                            {t(clave)}
                        </button>
                    ))}
                </div>
            </div>
        );

    const renderFechas = (sufijo: string) => (
        <div className="filtros-eventos-fechas">
            <label className="filtros-eventos-fecha-campo" htmlFor={`eventos-fecha-desde-${sufijo}`}>
                <span className="filtros-eventos-etiqueta">{t('filtros.desde')}</span>
                <input
                    id={`eventos-fecha-desde-${sufijo}`}
                    className="filtros-eventos-input"
                    type="date"
                    value={filtros.fechaDesde ?? ''}
                    max={filtros.fechaHasta}
                    aria-invalid={fechasInvalidas || undefined}
                    onChange={(evento) => onChange({ ...filtros, fechaDesde: evento.target.value || undefined })}
                />
            </label>
            <label className="filtros-eventos-fecha-campo" htmlFor={`eventos-fecha-hasta-${sufijo}`}>
                <span className="filtros-eventos-etiqueta">{t('filtros.hasta')}</span>
                <input
                    id={`eventos-fecha-hasta-${sufijo}`}
                    className="filtros-eventos-input"
                    type="date"
                    value={filtros.fechaHasta ?? ''}
                    min={filtros.fechaDesde}
                    aria-invalid={fechasInvalidas || undefined}
                    onChange={(evento) => onChange({ ...filtros, fechaHasta: evento.target.value || undefined })}
                />
            </label>
        </div>
    );

    const renderPeriodos = () => (
        <div className="filtros-eventos-periodos-grupo">
            <span className="filtros-eventos-etiqueta">{t('filtros.fechaEtiqueta')}</span>
            <div className="filtros-eventos-periodos" aria-label={t('filtros.rangosRapidos')}>
                {periodos.map(({ valor, clave }) => {
                    const rango = obtenerRangoPeriodo(valor);
                    const activo = mismoRango(filtros, rango);
                    return (
                        <button
                            key={valor}
                            type="button"
                            className={`filtros-eventos-periodo${activo ? ' filtros-eventos-periodo--activo' : ''}`}
                            aria-pressed={activo}
                            onClick={() => cambiarPeriodo(valor)}
                        >
                            {t(clave)}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <section className={`filtros-eventos${mostrarEstado ? ' filtros-eventos--gestion' : ''}`} aria-label={t('filtros.buscarYFiltrar')}>
            <div className="filtros-eventos-principal">
                <div className="filtros-eventos-busqueda-grupo">
                    <label className="filtros-eventos-etiqueta" htmlFor="buscar-eventos">{t('filtros.buscar')}</label>
                    <div className="filtros-eventos-busqueda-campo">
                        <Search className="filtros-eventos-busqueda-icono" aria-hidden="true" />
                        <input
                            id="buscar-eventos"
                            className="filtros-eventos-input filtros-eventos-busqueda"
                            type="search"
                            maxLength={100}
                            placeholder={t('filtros.placeholderBuscar')}
                            value={filtros.texto ?? ''}
                            onChange={(evento) => onChange({ ...filtros, texto: evento.target.value })}
                        />
                    </div>
                </div>

                <button
                    type="button"
                    className="filtros-eventos-abrir-movil"
                    aria-expanded={panelMovilAbierto}
                    onClick={() => setPanelMovilAbierto(true)}
                >
                    <SlidersHorizontal aria-hidden="true" />
                    {t('filtros.filtros')}
                    {filtrosActivos > 0 && <span className="filtros-eventos-contador">{filtrosActivos}</span>}
                </button>

                <div className="filtros-eventos-avanzados filtros-eventos-avanzados--escritorio">
                    {renderEstado()}
                    {renderFechas('escritorio')}
                </div>
            </div>
            <div className="filtros-eventos-secundarios">
                <div className="filtros-eventos-periodos-escritorio">{renderPeriodos()}</div>
                <div role="separator" className="filtros-eventos-separator" aria-orientation="vertical"/>
                <div className="filtros-eventos-categorias" aria-label={t('filtros.filtrarPorCategoria')}>
                    <span className="filtros-eventos-etiqueta">{t('filtros.categoriaEtiqueta')}</span>
                    <button
                        type="button"
                        className={`filtros-eventos-categoria${filtros.categoriaId === undefined ? ' filtros-eventos-categoria--activa' : ''}`}
                        aria-pressed={filtros.categoriaId === undefined}
                        onClick={() => cambiarCategoria()}
                    >
                        {t('filtros.todas')}
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
                            <span className="filtros-eventos-categoria-cantidad" aria-hidden="true">
                                {categoria.eventosActivos}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {mostrarResumen && hayFiltrosAplicados && (
                <div className="filtros-eventos-pie">
                    <ResumenEventos
                        cantidadEventos={cantidadEventos}
                        categorias={categorias}
                        filtros={filtros}
                        mostrarEstado={mostrarEstado}
                        orden={orden}
                        onChange={onChange}
                        onLimpiar={limpiarFiltros}
                        onOrdenChange={onOrdenChange}
                    />
                </div>
            )}

            {fechasInvalidas && (
                <p className="filtros-eventos-error" role="alert">
                    {t('filtros.fechaInvalida')}
                </p>
            )}

            {panelMovilAbierto && (
                <ModalAccesible
                    titulo={t('filtros.filtros')}
                    idTitulo="titulo-filtros-eventos"
                    onCerrar={() => setPanelMovilAbierto(false)}
                    variante="inferior"
                    icono={<SlidersHorizontal className="h-5 w-5" />}
                >
                    <div className="filtros-eventos-avanzados filtros-eventos-avanzados--movil">
                        {renderEstado()}
                        {renderFechas('movil')}
                        {renderPeriodos()}
                    </div>
                    <div className="filtros-eventos-acciones-movil">
                        <button type="button" className="filtros-eventos-limpiar" onClick={limpiarFiltros}>
                            <RotateCcw aria-hidden="true" />
                            {t('filtros.limpiar')}
                        </button>
                        <button
                            type="button"
                            className="filtros-eventos-listo"
                            onClick={() => setPanelMovilAbierto(false)}
                        >
                            {t('filtros.listo')}
                        </button>
                    </div>
                </ModalAccesible>
            )}
        </section>
    );
}
