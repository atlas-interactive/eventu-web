import { useEffect, useState } from 'react';
import type { SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { Categoria } from '../../types/categoria';
import type { Evento, EventoActualizacion, EventoSolicitud } from '../../types/evento';
import { Skeleton, SkeletonEstado } from '../../components/ui/Skeleton';
import { listarCategorias } from '../categorias/services/categoriaService';
import { crearEvento, editarEvento } from './services/eventoService';
import { mensajeDeError } from '../../api/mensajeDeError';
import { MAX_TITULO, MAX_UBICACION, validarEvento } from './validacionEvento';
import type { CamposEvento, ErroresEvento } from './validacionEvento';
import '../../styles/events.css';

interface FormularioEventoProps {
    // Sin evento crea (HU-05); con evento edita (HU-06)
    evento?: Evento;
    onGuardado: (mensaje: string) => void;
    onCancelar: () => void;
}

// "2026-10-20T14:30:00" -> "2026-10-20T14:30", que es lo que acepta <input type="datetime-local">
const aValorDeFecha = (fecha: string) => fecha.slice(0, 16);

const camposIniciales = (evento?: Evento): CamposEvento => ({
    titulo: evento?.titulo ?? '',
    descripcion: evento?.descripcion ?? '',
    fechaInicio: evento ? aValorDeFecha(evento.fechaInicio) : '',
    ubicacion: evento?.ubicacion ?? '',
    cuposMaximos: evento ? String(evento.cuposMaximos) : '',
    categoriaId: evento?.categoriaId ? String(evento.categoriaId) : '',
    certificable: Boolean(evento?.certificable),
});

// Al editar solo se envía lo que cambió: el backend ignora los campos ausentes
const cambios = (campos: CamposEvento, evento: Evento): EventoActualizacion => {
    const original = camposIniciales(evento);
    const resultado: EventoActualizacion = {};
    if (campos.titulo.trim() !== original.titulo) resultado.titulo = campos.titulo.trim();
    if (campos.descripcion.trim() !== original.descripcion) resultado.descripcion = campos.descripcion.trim();
    if (campos.fechaInicio !== original.fechaInicio) resultado.fechaInicio = campos.fechaInicio;
    if (campos.ubicacion.trim() !== original.ubicacion) resultado.ubicacion = campos.ubicacion.trim();
    if (campos.cuposMaximos !== original.cuposMaximos) resultado.cuposMaximos = Number(campos.cuposMaximos);
    if (campos.categoriaId !== original.categoriaId) resultado.categoriaId = Number(campos.categoriaId);
    if (campos.certificable !== original.certificable) resultado.certificable = campos.certificable;
    return resultado;
};

export function FormularioEvento({ evento, onGuardado, onCancelar }: FormularioEventoProps) {
    const { t } = useTranslation();
    const [campos, setCampos] = useState<CamposEvento>(() => camposIniciales(evento));
    const [errores, setErrores] = useState<ErroresEvento>({});
    const [errorGeneral, setErrorGeneral] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [cargandoCategorias, setCargandoCategorias] = useState(true);
    const [errorCategorias, setErrorCategorias] = useState('');

    const editando = Boolean(evento);
    const inscritos = evento ? evento.cuposMaximos - evento.cuposDisponibles : 0;

    useEffect(() => {
        // Evita actualizar el estado si la respuesta llega después de desmontar el formulario.
        let vigente = true;
        // Solo las activas: es el selector de HU-05 (criterio 2.0)
        listarCategorias(true)
            .then((datos) => {
                if (vigente) setCategorias(datos);
            })
            .catch((err: unknown) => {
                console.error('No se pudo cargar el listado de categorías:', err);
                if (vigente) setErrorCategorias(t('formulario.errorCategorias'));
            })
            .finally(() => {
                if (vigente) setCargandoCategorias(false);
            });
        return () => {
            vigente = false;
        };
    }, [t]);

    // Si la categoría actual del evento se desactivó, sigue apareciendo para no perderla al editar otros campos
    const opciones =
        evento?.categoriaId && !categorias.some((c) => c.id === evento.categoriaId)
            ? [...categorias, { id: evento.categoriaId, nombre: t('formulario.categoriaInactiva', { nombre: evento.categoriaNombre }) }]
            : categorias;

    const alCambiar = (campo: keyof CamposEvento) => (e: { target: { value: string } }) =>
        setCampos((previos) => ({ ...previos, [campo]: e.target.value }));

    const alEnviar = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorGeneral('');

        const encontrados = validarEvento(campos, {
            inscritos: editando ? inscritos : undefined,
            fechaOriginal: evento ? aValorDeFecha(evento.fechaInicio) : undefined,
        });
        setErrores(encontrados);
        if (Object.keys(encontrados).length > 0) return;

        setGuardando(true);
        try {
            if (evento) {
                const diferencias = cambios(campos, evento);
                if (Object.keys(diferencias).length === 0) {
                    setErrorGeneral(t('formulario.sinCambios'));
                    setGuardando(false);
                    return;
                }
                const respuesta = await editarEvento(evento.id, diferencias);
                onGuardado(respuesta.mensaje);
            } else {
                const solicitud: EventoSolicitud = {
                    titulo: campos.titulo.trim(),
                    descripcion: campos.descripcion.trim(),
                    fechaInicio: campos.fechaInicio,
                    ubicacion: campos.ubicacion.trim(),
                    cuposMaximos: Number(campos.cuposMaximos),
                    categoriaId: Number(campos.categoriaId),
                    certificable: campos.certificable,
                };
                const respuesta = await crearEvento(solicitud);
                onGuardado(respuesta.mensaje);
            }
        } catch (err: unknown) {
            setErrorGeneral(mensajeDeError(err));
            setGuardando(false);
        }
    };

    const mensajeCampo = (campo: keyof CamposEvento) =>
        errores[campo] && (
            <p id={`error-${campo}`} role="alert" className="workflow-inline-error evento-field-error">
                {errores[campo]}
            </p>
        );
    const describir = (campo: keyof CamposEvento, idAdicional?: string) =>
        [errores[campo] ? `error-${campo}` : undefined, idAdicional].filter(Boolean).join(' ') || undefined;

    return (
        <form
            onSubmit={alEnviar}
            noValidate
            className="evento-form"
        >
            <div>
                <label htmlFor="titulo" className="evento-field-label">
                    {t('formulario.titulo')} <span aria-hidden="true">*</span>
                </label>
                <input
                    id="titulo"
                    type="text"
                    maxLength={MAX_TITULO}
                    value={campos.titulo}
                    onChange={alCambiar('titulo')}
                    aria-invalid={errores.titulo ? true : undefined}
                    aria-required="true"
                    aria-describedby={describir('titulo')}
                    className="evento-control"
                    placeholder={t('formulario.placeholderTitulo')}
                />
                {mensajeCampo('titulo')}
            </div>

            <div>
                <label htmlFor="descripcion" className="evento-field-label">
                    {t('formulario.descripcion')} <span aria-hidden="true">*</span>
                </label>
                <textarea
                    id="descripcion"
                    rows={4}
                    value={campos.descripcion}
                    onChange={alCambiar('descripcion')}
                    aria-invalid={errores.descripcion ? true : undefined}
                    aria-describedby={describir('descripcion')}
                    className="evento-control evento-control--textarea"
                    placeholder={t('formulario.placeholderDescripcion')}
                    aria-required="true"
                />
                {mensajeCampo('descripcion')}
            </div>

            <div className="evento-form-grid">
                <div className="evento-field evento-field--date">
                    <label htmlFor="fechaInicio" className="evento-field-label">
                        {t('formulario.fechaHora')} <span aria-hidden="true">*</span>
                    </label>
                    <input
                        id="fechaInicio"
                        type="datetime-local"
                        value={campos.fechaInicio}
                        onChange={alCambiar('fechaInicio')}
                        aria-invalid={errores.fechaInicio ? true : undefined}
                        aria-describedby={describir('fechaInicio', !editando ? 'ayuda-fecha-futura' : undefined)}
                        className="evento-control"
                        aria-required="true"
                    />
                    {!editando && (
                        <p id="ayuda-fecha-futura" className="evento-help">
                            {t('formulario.ayudaFecha')}
                        </p>
                    )}
                    {mensajeCampo('fechaInicio')}
                </div>

                <div className="evento-field evento-field--location">
                    <label htmlFor="ubicacion" className="evento-field-label">
                        {t('formulario.ubicacion')} <span aria-hidden="true">*</span>
                    </label>
                    <input
                        id="ubicacion"
                        type="text"
                        maxLength={MAX_UBICACION}
                        value={campos.ubicacion}
                        onChange={alCambiar('ubicacion')}
                        aria-invalid={errores.ubicacion ? true : undefined}
                        aria-required="true"
                        aria-describedby={describir('ubicacion')}
                        className="evento-control"
                        placeholder={t('formulario.placeholderUbicacion')}
                    />
                    {mensajeCampo('ubicacion')}
                </div>

                <div className="evento-field evento-field--capacity">
                    <label htmlFor="cuposMaximos" className="evento-field-label">
                        {t('formulario.cupoMaximo')} <span aria-hidden="true">*</span>
                    </label>
                    <input
                        id="cuposMaximos"
                        type="number"
                        min={1}
                        step={1}
                        value={campos.cuposMaximos}
                        onChange={alCambiar('cuposMaximos')}
                        aria-invalid={errores.cuposMaximos ? true : undefined}
                        aria-required="true"
                        aria-describedby={describir('cuposMaximos')}
                        className="evento-control"
                        placeholder={t('formulario.placeholderCupo')}
                    />
                    {editando && (
                        <p className="evento-help">
                            {t('formulario.inscritosActuales', { inscritos })}
                        </p>
                    )}
                    {mensajeCampo('cuposMaximos')}
                </div>

                <div className="evento-field evento-field--category">
                    <label htmlFor="categoriaId" className="evento-field-label">
                        {t('formulario.categoria')} <span aria-hidden="true">*</span>
                    </label>
                    <div className="relative">
                        <select
                            id="categoriaId"
                            value={campos.categoriaId}
                            onChange={alCambiar('categoriaId')}
                            disabled={cargandoCategorias}
                            aria-busy={cargandoCategorias}
                            aria-invalid={errores.categoriaId ? true : undefined}
                            aria-required="true"
                            aria-describedby={describir('categoriaId')}
                            className={`evento-control evento-control--select ${cargandoCategorias ? 'text-transparent' : ''}`}
                        >
                            <option value="">{t('formulario.seleccionaCategoria')}</option>
                            {opciones.map((categoria) => (
                                <option key={categoria.id} value={categoria.id}>
                                    {categoria.nombre}
                                </option>
                            ))}
                        </select>
                        {cargandoCategorias && (
                            <SkeletonEstado
                                etiqueta={t('formulario.cargandoCategorias')}
                                className="pointer-events-none absolute inset-y-0 left-3 right-8 flex items-center"
                            >
                                <Skeleton className="h-4 w-36" />
                            </SkeletonEstado>
                        )}
                    </div>
                    {errorCategorias && (
                        <p role="alert" className="workflow-inline-error evento-field-error">
                            {errorCategorias}
                        </p>
                    )}
                    {mensajeCampo('categoriaId')}
                </div>
            </div>

            <div className="evento-certificable">
                <label className="evento-certificable-toggle">
                    <span className="evento-certificable-label">{t('formulario.certificable')}</span>
                    <input
                        type="checkbox"
                        role="switch"
                        checked={campos.certificable}
                        onChange={(e) =>
                            setCampos((previos) => ({ ...previos, certificable: e.target.checked }))
                        }
                        aria-describedby="ayuda-certificable"
                    />
                    <span className="evento-certificable-switch" aria-hidden="true">
                        <span />
                    </span>
                </label>
                <p id="ayuda-certificable" className="evento-help">
                    {t('formulario.ayudaCertificable')}
                </p>
            </div>

            {errorGeneral && (
                <p role="alert" className="evento-form-error">
                    {errorGeneral}
                </p>
            )}

            <div className="evento-form-actions">
                <button type="button" className="workflow-button workflow-button--secondary workflow-button--compact" onClick={onCancelar}>
                    {t('formulario.cancelar')}
                </button>
                <button type="submit" className="workflow-button workflow-button--primary workflow-button--compact" disabled={guardando}>
                    {guardando ? t('formulario.guardando') : editando ? t('formulario.guardarCambios') : t('formulario.crear')}
                </button>
            </div>
        </form>
    );
}
