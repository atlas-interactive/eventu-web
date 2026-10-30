import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Categoria } from '../../types/categoria';
import type { Evento, EventoActualizacion, EventoSolicitud } from '../../types/evento';
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
    return resultado;
};

export function FormularioEvento({ evento, onGuardado, onCancelar }: FormularioEventoProps) {
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
                if (vigente) setErrorCategorias('No se pudieron cargar las categorías. Intenta de nuevo más tarde.');
            })
            .finally(() => {
                if (vigente) setCargandoCategorias(false);
            });
        return () => {
            vigente = false;
        };
    }, []);

    // Si la categoría actual del evento se desactivó, sigue apareciendo para no perderla al editar otros campos
    const opciones =
        evento?.categoriaId && !categorias.some((c) => c.id === evento.categoriaId)
            ? [...categorias, { id: evento.categoriaId, nombre: `${evento.categoriaNombre} (inactiva)` }]
            : categorias;

    const alCambiar = (campo: keyof CamposEvento) => (e: { target: { value: string } }) =>
        setCampos((previos) => ({ ...previos, [campo]: e.target.value }));

    const alEnviar = async (e: FormEvent<HTMLFormElement>) => {
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
                    setErrorGeneral('No hay cambios para guardar.');
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
                    Título <span aria-hidden="true">*</span>
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
                    placeholder='Ej. Feria de proyectos de ingeniería'
                />
                {mensajeCampo('titulo')}
            </div>

            <div>
                <label htmlFor="descripcion" className="evento-field-label">
                    Descripción <span aria-hidden="true">*</span>
                </label>
                <textarea
                    id="descripcion"
                    rows={4}
                    value={campos.descripcion}
                    onChange={alCambiar('descripcion')}
                    aria-invalid={errores.descripcion ? true : undefined}
                    aria-describedby={describir('descripcion')}
                    className="evento-control evento-control--textarea"
                    placeholder='Describe brevemente el evento...'
                    aria-required="true"
                />
                {mensajeCampo('descripcion')}
            </div>

            <div className="evento-form-grid">
                <div className="evento-field evento-field--date">
                    <label htmlFor="fechaInicio" className="evento-field-label">
                        Fecha y hora <span aria-hidden="true">*</span>
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
                            La fecha debe ser futura.
                        </p>
                    )}
                    {mensajeCampo('fechaInicio')}
                </div>

                <div className="evento-field evento-field--location">
                    <label htmlFor="ubicacion" className="evento-field-label">
                        Ubicación <span aria-hidden="true">*</span>
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
                        placeholder='Ej. Auditorio Eduardo Carranza'
                    />
                    {mensajeCampo('ubicacion')}
                </div>

                <div className="evento-field evento-field--capacity">
                    <label htmlFor="cuposMaximos" className="evento-field-label">
                        Cupo máximo <span aria-hidden="true">*</span>
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
                        placeholder='Ej. 100'
                    />
                    {editando && (
                        <p className="evento-help">
                            Inscritos actuales: {inscritos}. Los cupos disponibles se recalculan al guardar.
                        </p>
                    )}
                    {mensajeCampo('cuposMaximos')}
                </div>

                <div className="evento-field evento-field--category">
                    <label htmlFor="categoriaId" className="evento-field-label">
                        Categoría <span aria-hidden="true">*</span>
                    </label>
                    <select
                        id="categoriaId"
                        value={campos.categoriaId}
                        onChange={alCambiar('categoriaId')}
                        disabled={cargandoCategorias}
                        aria-invalid={errores.categoriaId ? true : undefined}
                        aria-required="true"
                        aria-describedby={describir('categoriaId')}
                        className="evento-control evento-control--select"
                    >
                        <option value="">{cargandoCategorias ? 'Cargando…' : 'Selecciona una categoría'}</option>
                        {opciones.map((categoria) => (
                            <option key={categoria.id} value={categoria.id}>
                                {categoria.nombre}
                            </option>
                        ))}
                    </select>
                    {errorCategorias && (
                        <p role="alert" className="workflow-inline-error evento-field-error">
                            {errorCategorias}
                        </p>
                    )}
                    {mensajeCampo('categoriaId')}
                </div>
            </div>

            {errorGeneral && (
                <p role="alert" className="evento-form-error">
                    {errorGeneral}
                </p>
            )}

            <div className="evento-form-actions">
                <button type="button" className="workflow-button workflow-button--secondary workflow-button--compact" onClick={onCancelar}>
                    Cancelar
                </button>
                <button type="submit" className="workflow-button workflow-button--primary workflow-button--compact" disabled={guardando}>
                    {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear evento'}
                </button>
            </div>
        </form>
    );
}
