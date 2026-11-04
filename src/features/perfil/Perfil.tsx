import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { CalendarDays, LockKeyhole, Mail, Pencil, ShieldAlert } from 'lucide-react';
import { mensajeDeError } from '../../api/mensajeDeError';
import { Skeleton, SkeletonEstado } from '../../components/ui/Skeleton';
import { actualizarNombreSesion } from '../sesion/sesion';
import { actualizarPerfil, obtenerPerfil } from './services/perfilService';
import type { PerfilUsuario } from './types/perfil';

const ETIQUETA_ROL: Record<string, string> = {
    ADMIN: 'Administrador',
    ORGANIZADOR: 'Organizador',
    USUARIO: 'Usuario',
};

const inicialesNombre = (nombre: string): string =>
    nombre
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0].toLocaleUpperCase('es-CO'))
        .join('');

const fechaRegistro = (fecha: string | null): string => {
    if (!fecha) return 'No disponible';
    const valor = new Date(fecha);
    if (Number.isNaN(valor.getTime())) return 'No disponible';
    return new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }).format(valor);
};

export function Perfil() {
    const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState('');
    const [recarga, setRecarga] = useState(0);
    const [editando, setEditando] = useState(false);
    const [nombreEditado, setNombreEditado] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [errorGuardado, setErrorGuardado] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');

    useEffect(() => {
        let vigente = true;
        setCargando(true);
        setErrorCarga('');
        obtenerPerfil()
            .then((datos) => {
                if (vigente) setPerfil(datos);
            })
            .catch((error: unknown) => {
                console.error('No se pudo cargar el perfil:', error);
                if (vigente) setErrorCarga(mensajeDeError(error));
            })
            .finally(() => {
                if (vigente) setCargando(false);
            });
        return () => {
            vigente = false;
        };
    }, [recarga]);

    const iniciarEdicion = () => {
        if (!perfil) return;
        setNombreEditado(perfil.nombre);
        setErrorGuardado('');
        setMensajeExito('');
        setEditando(true);
    };

    const cancelarEdicion = () => {
        setNombreEditado(perfil?.nombre ?? '');
        setErrorGuardado('');
        setEditando(false);
    };

    const guardarCambios = async (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();
        if (!perfil) return;

        const nombre = nombreEditado.trim();
        if (!nombre) {
            setErrorGuardado('El nombre es obligatorio.');
            return;
        }
        if (nombre.length > 100) {
            setErrorGuardado('El nombre no puede superar los 100 caracteres.');
            return;
        }

        setGuardando(true);
        setErrorGuardado('');
        setMensajeExito('');
        try {
            const actualizado = await actualizarPerfil({
                nombre,
                codigoInstitucional: perfil.codigoInstitucional,
            });
            setPerfil(actualizado);
            setNombreEditado(actualizado.nombre);
            actualizarNombreSesion(actualizado.nombre);
            setEditando(false);
            setMensajeExito('Tu información se actualizó correctamente.');
        } catch (error: unknown) {
            console.error('No se pudo actualizar el perfil:', error);
            setErrorGuardado(mensajeDeError(error));
        } finally {
            setGuardando(false);
        }
    };

    return (
        <main className="mx-auto w-full max-w-[70rem] px-4 py-8 sm:px-8">
            <header className="mb-6">
                <h1 className="text-[1.375rem] font-semibold text-eventu-main-ink">Mi perfil</h1>
            </header>

            {mensajeExito && (
                <p role="status" className="mb-4 rounded-md bg-eventu-green-background px-4 py-3 text-sm text-eventu-success">
                    {mensajeExito}
                </p>
            )}

            {cargando && (
                <SkeletonEstado etiqueta="Cargando perfil" className="grid items-start gap-5 lg:grid-cols-2">
                    <div className="space-y-5">
                        <Skeleton className="h-44 rounded-xl" />
                        <Skeleton className="h-64 rounded-xl" />
                    </div>
                    <Skeleton className="h-44 rounded-xl" />
                </SkeletonEstado>
            )}

            {errorCarga && !cargando && (
                <div role="alert" className="rounded-xl border border-eventu-border bg-eventu-white-surface p-5">
                    <p className="text-sm text-eventu-error">{errorCarga}</p>
                    <button
                        type="button"
                        onClick={() => setRecarga((valor) => valor + 1)}
                        className="mt-4 rounded-md border border-eventu-field-border px-4 py-2 text-sm text-eventu-main-ink hover:bg-eventu-page-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red"
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {perfil && !cargando && (
                <div className="grid items-start gap-5 lg:grid-cols-2">
                    <div className="space-y-5">
                        <section className="overflow-hidden rounded-xl border border-eventu-border bg-eventu-white-surface shadow-sm">
                            <div className="h-1.5 bg-eventu-institutional-red" aria-hidden="true" />
                            <div className="p-5 sm:p-6">
                                <header className="flex items-center gap-4">
                                    <div
                                        role="img"
                                        aria-label={`Avatar de ${perfil.nombre}`}
                                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-eventu-soft-red-background text-lg font-semibold text-eventu-institutional-red ring-4 ring-eventu-soft-red-background/60"
                                    >
                                        {inicialesNombre(perfil.nombre)}
                                    </div>
                                    <div className="min-w-0">
                                        {!editando && (
                                            <h2 className="mt-0.5 break-words text-lg font-bold leading-tight text-eventu-main-ink">
                                                {perfil.nombre}
                                            </h2>
                                        )}
                                        <span className="mt-1 inline-flex rounded-full bg-eventu-soft-red-background px-2.5 py-0.5 text-xs font-medium text-eventu-institutional-red">
                                            {ETIQUETA_ROL[perfil.rol.toUpperCase()] ?? perfil.rol}
                                        </span>
                                    </div>
                                </header>

                                {editando ? (
                                    <form className="mt-6" onSubmit={guardarCambios}>
                                        <label htmlFor="perfil-nombre" className="block text-sm font-medium text-eventu-main-ink">
                                            Nombre completo
                                        </label>
                                        <input
                                            id="perfil-nombre"
                                            name="nombre"
                                            type="text"
                                            value={nombreEditado}
                                            onChange={(evento) => setNombreEditado(evento.target.value)}
                                            maxLength={100}
                                            required
                                            autoFocus
                                            className="mt-1 h-10 w-full rounded-md border border-eventu-field-border bg-eventu-white-surface px-3 text-sm text-eventu-main-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red"
                                        />
                                        {errorGuardado && (
                                            <p role="alert" className="mt-3 text-sm text-eventu-error">
                                                {errorGuardado}
                                            </p>
                                        )}
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <button
                                                type="submit"
                                                disabled={guardando}
                                                className="rounded-md bg-eventu-institutional-red px-4 py-2 text-sm font-medium text-eventu-white-surface transition-colors hover:bg-eventu-institutional-red-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {guardando ? 'Guardando…' : 'Guardar cambios'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelarEdicion}
                                                disabled={guardando}
                                                className="rounded-md border border-eventu-field-border px-4 py-2 text-sm text-eventu-main-ink transition-colors hover:bg-eventu-page-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                            <div className="min-w-0 rounded-lg bg-eventu-page-background p-3">
                                                <p className="flex items-center gap-2 text-xs font-medium text-eventu-secondary-text">
                                                    <Mail className="h-4 w-4 shrink-0 text-eventu-institutional-red" aria-hidden="true" />
                                                    Correo institucional
                                                </p>
                                                <p className="mt-1 break-all text-sm font-medium text-eventu-main-ink">{perfil.correo}</p>
                                            </div>
                                            <div className="rounded-lg bg-eventu-page-background p-3">
                                                <p className="flex items-center gap-2 text-xs font-medium text-eventu-secondary-text">
                                                    <CalendarDays className="h-4 w-4 shrink-0 text-eventu-institutional-red" aria-hidden="true" />
                                                    Miembro desde
                                                </p>
                                                <p className="mt-1 text-sm font-medium text-eventu-main-ink">
                                                    {fechaRegistro(perfil.creadoEn)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={iniciarEdicion}
                                            className="mt-5 inline-flex items-center gap-2 rounded-md border border-eventu-institutional-red px-4 py-2 text-sm font-medium text-eventu-institutional-red transition-colors hover:bg-eventu-soft-red-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red"
                                        >
                                            <Pencil className="h-4 w-4" aria-hidden="true" />
                                            Editar información
                                        </button>
                                    </>
                                )}
                            </div>
                        </section>

                        <section className="rounded-xl border border-eventu-border bg-eventu-white-surface p-5 sm:p-6">
                            <h2 className="flex items-center gap-2 text-base font-semibold text-eventu-main-ink">
                                <LockKeyhole className="h-5 w-5 text-eventu-secondary-text" aria-hidden="true" />
                                Cambiar contraseña
                            </h2>
                            <p className="mt-2 text-sm text-eventu-secondary-text">
                                La edición de contraseña estará disponible en una próxima etapa.
                            </p>
                            <div className="mt-4 space-y-3" aria-label="Cambio de contraseña no disponible">
                                <label className="block text-sm text-eventu-main-ink">
                                    Contraseña actual
                                    <input disabled type="password" placeholder="Ingresa tu contraseña actual" className="mt-1 h-10 w-full rounded-md border border-eventu-field-border px-3 text-sm disabled:cursor-not-allowed disabled:bg-eventu-page-background" />
                                </label>
                                <label className="block text-sm text-eventu-main-ink">
                                    Nueva contraseña
                                    <input disabled type="password" placeholder="Mínimo 8 caracteres" className="mt-1 h-10 w-full rounded-md border border-eventu-field-border px-3 text-sm disabled:cursor-not-allowed disabled:bg-eventu-page-background" />
                                </label>
                                <label className="block text-sm text-eventu-main-ink">
                                    Confirmar nueva contraseña
                                    <input disabled type="password" placeholder="Repite tu nueva contraseña" className="mt-1 h-10 w-full rounded-md border border-eventu-field-border px-3 text-sm disabled:cursor-not-allowed disabled:bg-eventu-page-background" />
                                </label>
                                <button
                                    type="button"
                                    disabled
                                    className="w-full rounded-md bg-eventu-institutional-red px-4 py-2.5 text-sm text-eventu-white-surface disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Actualizar contraseña
                                </button>
                            </div>
                        </section>
                    </div>

                    <section className="rounded-xl border border-eventu-border bg-eventu-white-surface p-5 sm:p-6">
                        <h2 className="flex items-center gap-2 text-base font-semibold text-eventu-main-ink">
                            <ShieldAlert className="h-5 w-5 text-eventu-institutional-red" aria-hidden="true" />
                            Desactivar cuenta
                        </h2>
                        <p className="mt-2 text-sm text-eventu-secondary-text">
                            La gestión de desactivación de cuenta estará disponible en una próxima etapa.
                        </p>
                        <button
                            type="button"
                            disabled
                            className="mt-4 rounded-md border border-eventu-institutional-red px-4 py-2 text-sm text-eventu-institutional-red disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Desactivar mi cuenta
                        </button>
                    </section>
                </div>
            )}
        </main>
    );
}
