import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Categoria } from '../../types/categoria';
import { ModalAccesible } from '../../components/ui/ModalAccesible';
import { Skeleton } from '../../components/ui/Skeleton';
import {
    activarCategoria,
    crearCategoria,
    desactivarCategoria,
    editarCategoria,
    listarCategorias,
} from './services/categoriaService';
import '../../styles/management.css';

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

export function GestionCategorias() {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState('');
    const [recarga, setRecarga] = useState(0);
    const [modal, setModal] = useState<ModalActivo>(null);
    const [mensajeExito, setMensajeExito] = useState('');

    useEffect(() => {
        // Evita actualizar el estado si la respuesta llega después de desmontar la pantalla.
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
        <main className="workflow-page">
            <header className="gestion-category-header">
                <div>
                    <h1 className="workflow-title">Categorías de eventos</h1>
                    <p className="workflow-description">
                        Clasifica los eventos y facilita su búsqueda a los usuarios.
                    </p>
                </div>
                <button type="button" className="workflow-button workflow-button--primary" onClick={() => setModal({ tipo: 'crear' })}>
                    + Nueva categoría
                </button>
            </header>

            {mensajeExito && (
                <div
                    role="status"
                    className="gestion-feedback gestion-feedback--success"
                >
                    {mensajeExito}
                </div>
            )}

            {errorCarga && (
                <div
                    role="alert"
                    className="gestion-feedback gestion-feedback--error"
                >
                    {errorCarga}
                </div>
            )}

            <div className="gestion-category-table-container">
                {/* En móvil cada fila se muestra como tarjeta; desde md es una tabla */}
                {cargando && <span role="status" className="sr-only">Cargando categorías</span>}
                <table className="gestion-category-table" aria-busy={cargando}>
                    <caption className="sr-only">Listado de categorías de eventos</caption>
                    <thead>
                        <tr>
                            <th scope="col">Nombre</th>
                            <th scope="col">Eventos activos</th>
                            <th scope="col">Estado</th>
                            <th scope="col">
                                <span className="gestion-category-actions-heading">Acciones</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {cargando && (
                            Array.from({ length: 3 }, (_, indice) => (
                                <tr key={indice} aria-hidden="true" className="gestion-category-row">
                                    <th scope="row" className="gestion-category-name">
                                        <Skeleton className="h-5 w-2/3" />
                                    </th>
                                    <td data-label="Eventos activos" className="gestion-category-cell">
                                        <Skeleton className="h-4 w-20" />
                                    </td>
                                    <td data-label="Estado" className="gestion-category-cell">
                                        <Skeleton className="h-6 w-20 rounded-full" />
                                    </td>
                                    <td className="gestion-category-actions-cell">
                                        <Skeleton className="h-9 w-20 rounded-md" />
                                    </td>
                                </tr>
                            ))
                        )}
                        {!cargando && categorias.length === 0 && !errorCarga && (
                            <tr>
                                <td colSpan={4} className="gestion-category-empty">
                                    Aún no hay categorías. Crea la primera con «Nueva categoría».
                                </td>
                            </tr>
                        )}
                        {categorias.map((categoria) => (
                            <tr
                                key={categoria.id}
                                className="gestion-category-row"
                            >
                                <th scope="row" className="gestion-category-name">
                                    {categoria.nombre}
                                </th>
                                <td
                                    data-label="Eventos activos"
                                    className="gestion-category-cell"
                                >
                                    {textoEventos(categoria.eventosActivos)}
                                </td>
                                <td data-label="Estado" className="gestion-category-cell gestion-category-state-cell">
                                    <span
                                        className={`gestion-category-state ${categoria.activo ? 'gestion-category-state--active' : 'gestion-category-state--inactive'}`}
                                    >
                                        {categoria.activo ? 'Activa' : 'Inactiva'}
                                    </span>
                                </td>
                                <td className="gestion-category-actions-cell">
                                    <div className="gestion-category-actions">
                                        <button
                                            type="button"
                                            className="gestion-category-action gestion-category-action--edit"
                                            aria-label={`Editar categoría ${categoria.nombre}`}
                                            onClick={() => setModal({ tipo: 'editar', categoria })}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            type="button"
                                            className={`gestion-category-action ${categoria.activo ? 'gestion-category-action--deactivate' : 'gestion-category-action--activate'}`}
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
                <label htmlFor="nombre-categoria" className="workflow-label">
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
                    className="gestion-category-input"
                />
                {error && (
                    <p id="error-nombre-categoria" role="alert" className="workflow-inline-error gestion-category-field-error">
                        {error}
                    </p>
                )}
                <div className="workflow-dialog-actions">
                    <button type="button" className="workflow-button workflow-button--secondary" onClick={onCerrar}>
                        Cancelar
                    </button>
                    <button type="submit" className="workflow-button workflow-button--primary" disabled={guardando}>
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
            <p className="gestion-confirmation-copy">
                {desactivando
                    ? `¿Desactivar la categoría «${categoria.nombre}»? Dejará de aparecer al crear eventos nuevos.`
                    : `¿Activar la categoría «${categoria.nombre}»? Volverá a estar disponible al crear eventos.`}
            </p>
            {desactivando && categoria.eventosActivos > 0 && (
                <p className="gestion-confirmation-note">
                    Los {textoEventos(categoria.eventosActivos)} activos que ya la usan conservarán su categoría.
                </p>
            )}
            {error && (
                <p role="alert" className="workflow-inline-error gestion-confirmation-error">
                    {error}
                </p>
            )}
            <div className="workflow-dialog-actions">
                <button type="button" className="workflow-button workflow-button--secondary" onClick={onCerrar}>
                    Cancelar
                </button>
                <button type="button" className="workflow-button workflow-button--primary" onClick={confirmar} disabled={procesando}>
                    {procesando ? 'Procesando…' : desactivando ? 'Desactivar' : 'Activar'}
                </button>
            </div>
        </ModalAccesible>
    );
}