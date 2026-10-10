import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Categoria } from '../../types/categoria';
import type { Evento, EventoActualizacion, EventoSolicitud } from '../../types/evento';
import { listarCategorias } from '../categorias/services/categoriaService';
import { crearEvento, editarEvento } from './services/eventoService';
import { mensajeDeError } from './mensajeDeError';
import { MAX_TITULO, MAX_UBICACION, validarEvento } from './validacionEvento';
import type { CamposEvento, ErroresEvento } from './validacionEvento';

interface FormularioEventoProps {
    // Sin evento crea (HU-05); con evento edita (HU-06)
    evento?: Evento;
    onGuardado: (mensaje: string) => void;
    onCancelar: () => void;
}

const botonPrimario =
    'rounded-[0.4375rem] bg-eventu-institutional-red px-4 py-2 text-sm font-medium text-eventu-white-surface hover:bg-eventu-institutional-red-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red disabled:opacity-60';
const botonSecundario =
    'rounded-[0.4375rem] border border-eventu-field-border bg-eventu-white-surface px-4 py-2 text-sm font-medium text-eventu-main-ink hover:bg-eventu-page-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red';

const clasesCampo = (conError: boolean) =>
    `w-full rounded-md border px-3 text-sm text-eventu-main-ink outline-none focus:ring-1 ${
        conError
            ? 'border-eventu-institutional-red focus:ring-eventu-institutional-red'
            : 'border-eventu-field-border focus:ring-eventu-field-border'
    }`;

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
            ? [...categorias, { id: evento.categoriaId, nombre: `${evento.categoriaNombre ?? 'Categoría actual'} (inactiva)` }]
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
            <p id={`error-${campo}`} role="alert" className="mt-1 text-sm text-eventu-error">
                {errores[campo]}
            </p>
        );
    const describir = (campo: keyof CamposEvento) => (errores[campo] ? `error-${campo}` : undefined);

    return (
        <form onSubmit={alEnviar} noValidate className="space-y-5">
            <div>
                <label htmlFor="titulo" className="mb-1 block text-sm font-medium text-eventu-main-ink">
                    Título
                </label>
                <input
                    id="titulo"
                    type="text"
                    maxLength={MAX_TITULO}
                    value={campos.titulo}
                    onChange={alCambiar('titulo')}
                    aria-invalid={errores.titulo ? true : undefined}
                    aria-describedby={describir('titulo')}
                    className={`h-10 ${clasesCampo(Boolean(errores.titulo))}`}
                />
                {mensajeCampo('titulo')}
            </div>

            <div>
                <label htmlFor="descripcion" className="mb-1 block text-sm font-medium text-eventu-main-ink">
                    Descripción
                </label>
                <textarea
                    id="descripcion"
                    rows={4}
                    value={campos.descripcion}
                    onChange={alCambiar('descripcion')}
                    aria-invalid={errores.descripcion ? true : undefined}
                    aria-describedby={describir('descripcion')}
                    className={`py-2 ${clasesCampo(Boolean(errores.descripcion))}`}
                />
                {mensajeCampo('descripcion')}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <label htmlFor="fechaInicio" className="mb-1 block text-sm font-medium text-eventu-main-ink">
                        Fecha y hora de inicio
                    </label>
                    <input
                        id="fechaInicio"
                        type="datetime-local"
                        value={campos.fechaInicio}
                        onChange={alCambiar('fechaInicio')}
                        aria-invalid={errores.fechaInicio ? true : undefined}
                        aria-describedby={describir('fechaInicio')}
                        className={`h-10 ${clasesCampo(Boolean(errores.fechaInicio))}`}
                    />
                    {mensajeCampo('fechaInicio')}
                </div>

                <div>
                    <label htmlFor="ubicacion" className="mb-1 block text-sm font-medium text-eventu-main-ink">
                        Ubicación
                    </label>
                    <input
                        id="ubicacion"
                        type="text"
                        maxLength={MAX_UBICACION}
                        value={campos.ubicacion}
                        onChange={alCambiar('ubicacion')}
                        aria-invalid={errores.ubicacion ? true : undefined}
                        aria-describedby={describir('ubicacion')}
                        className={`h-10 ${clasesCampo(Boolean(errores.ubicacion))}`}
                    />
                    {mensajeCampo('ubicacion')}
                </div>

                <div>
                    <label htmlFor="cuposMaximos" className="mb-1 block text-sm font-medium text-eventu-main-ink">
                        Cupo máximo
                    </label>
                    <input
                        id="cuposMaximos"
                        type="number"
                        min={1}
                        step={1}
                        value={campos.cuposMaximos}
                        onChange={alCambiar('cuposMaximos')}
                        aria-invalid={errores.cuposMaximos ? true : undefined}
                        aria-describedby={describir('cuposMaximos')}
                        className={`h-10 ${clasesCampo(Boolean(errores.cuposMaximos))}`}
                    />
                    {editando && (
                        <p className="mt-1 text-xs text-eventu-secondary-text">
                            Inscritos actuales: {inscritos}. Los cupos disponibles se recalculan al guardar.
                        </p>
                    )}
                    {mensajeCampo('cuposMaximos')}
                </div>

                <div>
                    <label htmlFor="categoriaId" className="mb-1 block text-sm font-medium text-eventu-main-ink">
                        Categoría
                    </label>
                    <select
                        id="categoriaId"
                        value={campos.categoriaId}
                        onChange={alCambiar('categoriaId')}
                        disabled={cargandoCategorias}
                        aria-invalid={errores.categoriaId ? true : undefined}
                        aria-describedby={describir('categoriaId')}
                        className={`h-10 bg-eventu-white-surface ${clasesCampo(Boolean(errores.categoriaId))}`}
                    >
                        <option value="">{cargandoCategorias ? 'Cargando…' : 'Selecciona una categoría'}</option>
                        {opciones.map((categoria) => (
                            <option key={categoria.id} value={categoria.id}>
                                {categoria.nombre}
                            </option>
                        ))}
                    </select>
                    {errorCategorias && (
                        <p role="alert" className="mt-1 text-sm text-eventu-error">
                            {errorCategorias}
                        </p>
                    )}
                    {mensajeCampo('categoriaId')}
                </div>
            </div>

            {errorGeneral && (
                <p role="alert" className="text-sm text-eventu-error">
                    {errorGeneral}
                </p>
            )}

            <div className="flex justify-end gap-3">
                <button type="button" className={botonSecundario} onClick={onCancelar}>
                    Cancelar
                </button>
                <button type="submit" className={botonPrimario} disabled={guardando}>
                    {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear evento'}
                </button>
            </div>
        </form>
    );
}
