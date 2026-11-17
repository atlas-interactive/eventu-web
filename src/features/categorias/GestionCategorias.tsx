import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { isAxiosError } from 'axios';
import { Pencil, Plus, Power, PowerOff, Tags } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import type { Categoria } from '../../types/categoria';
import { IconoAviso } from '../../components/ui/IconoAviso';
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

// Muestra el mensaje que envía el backend ({"error": "..."}), por ejemplo el 409 de nombre duplicado
const mensajeDeError = (err: unknown): string => {
    if (isAxiosError<{ error?: string }>(err) && err.response?.data?.error) {
        return err.response.data.error;
    }
    return i18n.t('comun.errorInesperado');
};

const textoEventos = (cantidad: number) => i18n.t('categorias.eventosCount', { count: cantidad });

export function GestionCategorias() {
    const { t } = useTranslation();
    useDocumentTitle(`${t('categorias.titulo')} | EventU`);
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
                    <h1 className="workflow-title">{t('categorias.titulo')}</h1>
                    <p className="workflow-description">
                        {t('categorias.descripcion')}
                    </p>
                </div>
                <button type="button" className="workflow-button workflow-button--primary gap-1.5" onClick={() => setModal({ tipo: 'crear' })}>
                    <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {t('categorias.nueva')}
                </button>
            </header>

            {mensajeExito && (
                <div
                    role="status"
                    className="gestion-feedback gestion-feedback--success flex items-start gap-2"
                >
                    <IconoAviso tipo="exito" className="mt-0.5 h-4 w-4" />
                    <span>{mensajeExito}</span>
                </div>
            )}

            {errorCarga && (
                <div
                    role="alert"
                    className="gestion-feedback gestion-feedback--error flex items-start gap-2"
                >
                    <IconoAviso tipo="error" className="mt-0.5 h-4 w-4" />
                    <span>{errorCarga}</span>
                </div>
            )}

            <div className="gestion-category-table-container">
                {/* En móvil cada fila se muestra como tarjeta; desde md es una tabla */}
                {cargando && <span role="status" className="sr-only">{t('categorias.cargando')}</span>}
                <table className="gestion-category-table" aria-busy={cargando}>
                    <caption className="sr-only">{t('categorias.listadoAria')}</caption>
                    <thead>
                        <tr>
                            <th scope="col">{t('categorias.nombre')}</th>
                            <th scope="col">{t('categorias.eventosActivos')}</th>
                            <th scope="col">{t('categorias.estado')}</th>
                            <th scope="col">
                                <span className="gestion-category-actions-heading">{t('categorias.acciones')}</span>
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
                                    <td data-label={t('categorias.eventosActivos')} className="gestion-category-cell">
                                        <Skeleton className="h-4 w-20" />
                                    </td>
                                    <td data-label={t('categorias.estado')} className="gestion-category-cell">
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
                                    <Tags className="mr-2 inline h-4 w-4 align-text-bottom" aria-hidden="true" />
                                    {t('categorias.vacio')}
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
                                    data-label={t('categorias.eventosActivos')}
                                    className="gestion-category-cell"
                                >
                                    {textoEventos(categoria.eventosActivos)}
                                </td>
                                <td data-label={t('categorias.estado')} className="gestion-category-cell gestion-category-state-cell">
                                    <span
                                        className={`gestion-category-state ${categoria.activo ? 'gestion-category-state--active' : 'gestion-category-state--inactive'}`}
                                    >
                                        {categoria.activo ? t('categorias.activa') : t('categorias.inactiva')}
                                    </span>
                                </td>
                                <td className="gestion-category-actions-cell">
                                    <div className="gestion-category-actions">
                                        <button
                                            type="button"
                                            className="gestion-category-action gestion-category-action--edit"
                                            aria-label={t('categorias.editarAria', { nombre: categoria.nombre })}
                                            onClick={() => setModal({ tipo: 'editar', categoria })}
                                        >
                                            <Pencil className="h-4 w-4 shrink-0" aria-hidden="true" />
                                            {t('categorias.editar')}
                                        </button>
                                        <button
                                            type="button"
                                            className={`gestion-category-action ${categoria.activo ? 'gestion-category-action--deactivate' : 'gestion-category-action--activate'}`}
                                            aria-label={categoria.activo
                                                ? t('categorias.desactivarAria', { nombre: categoria.nombre })
                                                : t('categorias.activarAria', { nombre: categoria.nombre })}
                                            onClick={() => setModal({ tipo: 'estado', categoria })}
                                        >
                                            {categoria.activo
                                                ? <PowerOff className="h-4 w-4 shrink-0" aria-hidden="true" />
                                                : <Power className="h-4 w-4 shrink-0" aria-hidden="true" />}
                                            {categoria.activo ? t('categorias.desactivar') : t('categorias.activar')}
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
                    onGuardado={() => alTerminarAccion(t('categorias.creada'))}
                />
            )}
            {modal?.tipo === 'editar' && (
                <FormularioCategoria
                    categoria={modal.categoria}
                    onCerrar={() => setModal(null)}
                    onGuardado={() => alTerminarAccion(t('categorias.actualizada'))}
                />
            )}
            {modal?.tipo === 'estado' && (
                <ConfirmarEstado
                    categoria={modal.categoria}
                    onCerrar={() => setModal(null)}
                    onConfirmado={() =>
                        alTerminarAccion(
                            modal.categoria.activo
                                ? t('categorias.desactivada')
                                : t('categorias.activada'),
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
    const { t } = useTranslation();
    const [nombre, setNombre] = useState(categoria?.nombre ?? '');
    const [error, setError] = useState('');
    const [guardando, setGuardando] = useState(false);

    const alEnviar = async (evento: SubmitEvent<HTMLFormElement>) => {
        evento.preventDefault();
        const nombreLimpio = nombre.trim();
        if (!nombreLimpio) {
            setError(t('categorias.errorNombre'));
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

    const titulo = categoria ? t('categorias.editarTitulo') : t('categorias.nuevaTitulo');

    return (
        <ModalAccesible titulo={titulo} idTitulo="titulo-formulario-categoria" onCerrar={onCerrar}>
            <form onSubmit={alEnviar} noValidate>
                <label htmlFor="nombre-categoria" className="workflow-label">
                    {t('categorias.nombreCategoria')}
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
                        {t('categorias.cancelar')}
                    </button>
                    <button type="submit" className="workflow-button workflow-button--primary" disabled={guardando}>
                        {guardando ? t('categorias.guardando') : t('categorias.guardar')}
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
    const { t } = useTranslation();
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
            titulo={desactivando ? t('categorias.desactivarTitulo') : t('categorias.activarTitulo')}
            idTitulo="titulo-confirmar-estado"
            onCerrar={onCerrar}
        >
            <p className="gestion-confirmation-copy">
                {desactivando
                    ? t('categorias.confirmarDesactivar', { nombre: categoria.nombre })
                    : t('categorias.confirmarActivar', { nombre: categoria.nombre })}
            </p>
            {desactivando && categoria.eventosActivos > 0 && (
                <p className="gestion-confirmation-note">
                    {t('categorias.notaEventosActivos', { count: categoria.eventosActivos })}
                </p>
            )}
            {error && (
                <p role="alert" className="workflow-inline-error gestion-confirmation-error">
                    {error}
                </p>
            )}
            <div className="workflow-dialog-actions">
                <button type="button" className="workflow-button workflow-button--secondary" onClick={onCerrar}>
                    {t('categorias.cancelar')}
                </button>
                <button type="button" className="workflow-button workflow-button--primary" onClick={confirmar} disabled={procesando}>
                    {procesando ? t('categorias.procesando') : desactivando ? t('categorias.desactivar') : t('categorias.activar')}
                </button>
            </div>
        </ModalAccesible>
    );
}