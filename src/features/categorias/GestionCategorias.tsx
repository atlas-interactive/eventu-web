import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Categoria } from '../../types/categoria';
import { ModalAccesible } from './components/ModalAccesible';
import {
    activarCategoria,
    crearCategoria,
    desactivarCategoria,
    editarCategoria,
    listarCategorias,
} from './services/categoriaService';

type ModalActivo =
    | { tipo: 'crear' }
    | { tipo: 'editar'; categoria: Categoria }
    | { tipo: 'estado'; categoria: Categoria }
    | null;

const MENSAJE_INESPERADO = 'Ocurrió un error inesperado al conectar con el servidor.';

// Muestra el mensaje que envía el backend ({"error": "..."}), por ejemplo el 409 de nombre duplicado
const mensajeDeError = (err: unknown): string => {
    if (isAxiosError<{ error?: string }>(err) && err.response?.data?.error) {
        return err.response.data.error;
    }
    return MENSAJE_INESPERADO;
};

const textoEventos = (cantidad: number) => `${cantidad} ${cantidad === 1 ? 'evento' : 'eventos'}`;

// En móvil la celda muestra su etiqueta (data-label) a la izquierda y el valor a la derecha
const celdaMovil =
    'flex items-center justify-between before:text-xs before:font-medium before:uppercase before:text-eventu-secondary-text before:content-[attr(data-label)] md:before:content-none';

const botonPrimario =
    'rounded-[0.4375rem] bg-eventu-institutional-red px-4 py-2 text-sm font-medium text-eventu-white-surface hover:bg-eventu-institutional-red-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red disabled:opacity-60';
const botonSecundario =
    'rounded-[0.4375rem] border border-eventu-field-border bg-eventu-white-surface px-4 py-2 text-sm font-medium text-eventu-main-ink hover:bg-eventu-page-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red';
// Botones de acción de cada fila: mismo ancho (112 px) y 44 px de alto (WCAG 2.5.5 AAA) para que se vean uniformes y se pulsen con comodidad
const botonFila =
    'inline-flex h-11 w-28 items-center justify-center rounded-[0.4375rem] border bg-eventu-white-surface px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red';
const botonEditar = `${botonFila} border-eventu-field-border text-eventu-main-ink hover:bg-eventu-page-background`;
const botonDesactivar = `${botonFila} border-eventu-institutional-red text-eventu-institutional-red hover:bg-eventu-soft-red-background`;
const botonActivar = `${botonFila} border-eventu-success text-eventu-success hover:bg-eventu-green-background`;

export function GestionCategorias() {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState('');
    const [recarga, setRecarga] = useState(0);
    const [modal, setModal] = useState<ModalActivo>(null);
    const [mensajeExito, setMensajeExito] = useState('');

    useEffect(() => {
        let vigente = true;
        listarCategorias(false)
            .then((datos) => {
                if (!vigente) return;
                setCategorias(datos);
                setErrorCarga('');
            })
            .catch((err: unknown) => {
                // Deja el detalle técnico en la consola del navegador para poder diagnosticar (URL mal puesta, CORS, backend caído)
                console.error('No se pudo cargar el listado de categorías:', err);
                if (vigente) setErrorCarga(mensajeDeError(err));
            })
            .finally(() => {
                if (vigente) setCargando(false);
            });
        return () => {
            vigente = false;
        };
    }, [recarga]);

    const alTerminarAccion = (mensaje: string) => {
        setModal(null);
        setMensajeExito(mensaje);
        setRecarga((valor) => valor + 1);
    };

    return (
        <main className="mx-auto w-full max-w-[70rem] px-4 py-8 sm:px-8">
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-[1.375rem] font-semibold text-eventu-main-ink">Categorías de eventos</h1>
                    <p className="mt-1 text-sm text-eventu-secondary-text">
                        Clasifica los eventos y facilita su búsqueda a los usuarios.
                    </p>
                </div>
                <button type="button" className={botonPrimario} onClick={() => setModal({ tipo: 'crear' })}>
                    + Nueva categoría
                </button>
            </header>

            {mensajeExito && (
                <div
                    role="status"
                    className="mb-4 rounded border border-eventu-success bg-eventu-green-background p-3 text-sm text-eventu-success"
                >
                    {mensajeExito}
                </div>
            )}

            {errorCarga && (
                <div
                    role="alert"
                    className="mb-4 rounded border border-eventu-soft-red-background bg-eventu-red-background p-3 text-sm text-eventu-error"
                >
                    {errorCarga}
                </div>
            )}

            <div className="rounded-xl border border-eventu-border bg-eventu-white-surface">
                {/* En móvil cada fila se muestra como tarjeta; desde md es una tabla */}
                <table className="block w-full border-collapse text-left md:table">
                    <caption className="sr-only">Listado de categorías de eventos</caption>
                    <thead className="hidden md:table-header-group">
                        <tr className="border-b border-eventu-border text-xs uppercase tracking-wide text-eventu-secondary-text">
                            <th scope="col" className="px-6 py-4 font-medium">Nombre</th>
                            <th scope="col" className="px-6 py-4 font-medium">Eventos activos</th>
                            <th scope="col" className="px-6 py-4 font-medium">Estado</th>
                            <th scope="col" className="px-6 py-4 font-medium">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="block md:table-row-group">
                        {cargando && (
                            <tr>
                                <td colSpan={4} className="px-6 py-6 text-sm text-eventu-secondary-text">
                                    Cargando categorías…
                                </td>
                            </tr>
                        )}
                        {!cargando && categorias.length === 0 && !errorCarga && (
                            <tr>
                                <td colSpan={4} className="px-6 py-6 text-sm text-eventu-secondary-text">
                                    Aún no hay categorías. Crea la primera con «Nueva categoría».
                                </td>
                            </tr>
                        )}
                        {categorias.map((categoria) => (
                            <tr
                                key={categoria.id}
                                className="block space-y-2 border-b border-eventu-border p-4 last:border-b-0 md:table-row md:space-y-0 md:p-0"
                            >
                                <th scope="row" className="block text-left text-base font-medium text-eventu-main-ink md:table-cell md:px-6 md:py-4 md:text-sm">
                                    {categoria.nombre}
                                </th>
                                <td
                                    data-label="Eventos activos"
                                    className={`${celdaMovil} text-sm text-eventu-secondary-text md:table-cell md:px-6 md:py-4`}
                                >
                                    {textoEventos(categoria.eventosActivos)}
                                </td>
                                <td data-label="Estado" className={`${celdaMovil} md:table-cell md:px-6 md:py-4`}>
                                    <span
                                        className={
                                            categoria.activo
                                                ? 'inline-block rounded bg-eventu-green-background px-3 py-1 text-xs font-medium text-eventu-success'
                                                : 'inline-block rounded bg-[#ededeb] px-3 py-1 text-xs font-medium text-eventu-secondary-text'
                                        }
                                    >
                                        {categoria.activo ? 'Activa' : 'Inactiva'}
                                    </span>
                                </td>
                                <td className="block pt-1 md:table-cell md:px-6 md:py-4">
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            className={botonEditar}
                                            aria-label={`Editar categoría ${categoria.nombre}`}
                                            onClick={() => setModal({ tipo: 'editar', categoria })}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            type="button"
                                            className={categoria.activo ? botonDesactivar : botonActivar}
                                            aria-label={`${categoria.activo ? 'Desactivar' : 'Activar'} categoría ${categoria.nombre}`}
                                            onClick={() => setModal({ tipo: 'estado', categoria })}
                                        >
                                            {categoria.activo ? 'Desactivar' : 'Activar'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modal?.tipo === 'crear' && (
                <FormularioCategoria
                    onCerrar={() => setModal(null)}
                    onGuardado={() => alTerminarAccion('Categoría creada correctamente.')}
                />
            )}
            {modal?.tipo === 'editar' && (
                <FormularioCategoria
                    categoria={modal.categoria}
                    onCerrar={() => setModal(null)}
                    onGuardado={() => alTerminarAccion('Categoría actualizada correctamente.')}
                />
            )}
            {modal?.tipo === 'estado' && (
                <ConfirmarEstado
                    categoria={modal.categoria}
                    onCerrar={() => setModal(null)}
                    onConfirmado={() =>
                        alTerminarAccion(
                            modal.categoria.activo
                                ? 'Categoría desactivada correctamente.'
                                : 'Categoría activada correctamente.',
                        )
                    }
                />
            )}
        </main>
    );
}

interface FormularioCategoriaProps {
    categoria?: Categoria;
    onCerrar: () => void;
    onGuardado: () => void;
}

// Sirve para crear (sin categoria) y para editar el nombre (con categoria)
function FormularioCategoria({ categoria, onCerrar, onGuardado }: FormularioCategoriaProps) {
    const [nombre, setNombre] = useState(categoria?.nombre ?? '');
    const [error, setError] = useState('');
    const [guardando, setGuardando] = useState(false);

    const alEnviar = async (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();
        const nombreLimpio = nombre.trim();
        if (!nombreLimpio) {
            setError('El nombre de la categoría es obligatorio.');
            return;
        }

        setGuardando(true);
        setError('');
        try {
            if (categoria) {
                await editarCategoria(categoria.id, { nombre: nombreLimpio });
            } else {
                await crearCategoria({ nombre: nombreLimpio });
            }
            onGuardado();
        } catch (err: unknown) {
            setError(mensajeDeError(err));
            setGuardando(false);
        }
    };

    const titulo = categoria ? 'Editar categoría' : 'Nueva categoría';

    return (
        <ModalAccesible titulo={titulo} idTitulo="titulo-formulario-categoria" onCerrar={onCerrar}>
            <form onSubmit={alEnviar} noValidate>
                <label htmlFor="nombre-categoria" className="mb-1 block text-sm font-medium text-eventu-main-ink">
                    Nombre de la categoría
                </label>
                <input
                    id="nombre-categoria"
                    name="nombre"
                    type="text"
                    maxLength={50}
                    value={nombre}
                    onChange={(evento) => setNombre(evento.target.value)}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? 'error-nombre-categoria' : undefined}
                    className={`h-10 w-full rounded-md border px-3 text-sm text-eventu-main-ink outline-none focus:ring-1 ${
                        error
                            ? 'border-eventu-institutional-red focus:ring-eventu-institutional-red'
                            : 'border-eventu-field-border focus:ring-eventu-field-border'
                    }`}
                />
                {error && (
                    <p id="error-nombre-categoria" role="alert" className="mt-2 text-sm text-eventu-error">
                        {error}
                    </p>
                )}
                <div className="mt-6 flex justify-end gap-3">
                    <button type="button" className={botonSecundario} onClick={onCerrar}>
                        Cancelar
                    </button>
                    <button type="submit" className={botonPrimario} disabled={guardando}>
                        {guardando ? 'Guardando…' : 'Guardar'}
                    </button>
                </div>
            </form>
        </ModalAccesible>
    );
}

interface ConfirmarEstadoProps {
    categoria: Categoria;
    onCerrar: () => void;
    onConfirmado: () => void;
}

// Activar o desactivar nunca elimina la categoría: los eventos que ya la usan la conservan
function ConfirmarEstado({ categoria, onCerrar, onConfirmado }: ConfirmarEstadoProps) {
    const [error, setError] = useState('');
    const [procesando, setProcesando] = useState(false);
    const desactivando = categoria.activo;

    const confirmar = async () => {
        setProcesando(true);
        setError('');
        try {
            // Solo se envía el id: el backend saca al administrador del token y tiene un endpoint para cada acción
            await (categoria.activo ? desactivarCategoria : activarCategoria)(categoria.id);
            onConfirmado();
        } catch (err: unknown) {
            setError(mensajeDeError(err));
            setProcesando(false);
        }
    };

    return (
        <ModalAccesible
            titulo={desactivando ? 'Desactivar categoría' : 'Activar categoría'}
            idTitulo="titulo-confirmar-estado"
            onCerrar={onCerrar}
        >
            <p className="text-sm text-eventu-main-ink">
                {desactivando
                    ? `¿Desactivar la categoría «${categoria.nombre}»? Dejará de aparecer al crear eventos nuevos.`
                    : `¿Activar la categoría «${categoria.nombre}»? Volverá a estar disponible al crear eventos.`}
            </p>
            {desactivando && categoria.eventosActivos > 0 && (
                <p className="mt-2 text-sm text-eventu-secondary-text">
                    Los {textoEventos(categoria.eventosActivos)} activos que ya la usan conservarán su categoría.
                </p>
            )}
            {error && (
                <p role="alert" className="mt-3 text-sm text-eventu-error">
                    {error}
                </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
                <button type="button" className={botonSecundario} onClick={onCerrar}>
                    Cancelar
                </button>
                <button type="button" className={botonPrimario} onClick={confirmar} disabled={procesando}>
                    {procesando ? 'Procesando…' : desactivando ? 'Desactivar' : 'Activar'}
                </button>
            </div>
        </ModalAccesible>
    );
}