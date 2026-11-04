import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { CalendarDays, LockKeyhole, Mail, Pencil, ShieldAlert } from 'lucide-react';
import { mensajeDeError } from '../../api/mensajeDeError';
import { Skeleton, SkeletonEstado } from '../../components/ui/Skeleton';
import { actualizarNombreSesion, actualizarTokenSesion } from '../sesion/sesion';
import { actualizarPerfil, cambiarContrasena, obtenerPerfil } from './services/perfilService';
import type { PerfilUsuario } from '../../types/perfil';
import '../../styles/perfil.css';

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
    const [passwordActual, setPasswordActual] = useState('');
    const [passwordNueva, setPasswordNueva] = useState('');
    const [confirmacionContrasena, setConfirmacionContrasena] = useState('');
    const [cambiandoContrasena, setCambiandoContrasena] = useState(false);
    const [errorContrasena, setErrorContrasena] = useState('');

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

    const guardarContrasena = async (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();
        setErrorContrasena('');
        setMensajeExito('');

        if (passwordNueva.length < 8 || passwordNueva.length > 72) {
            setErrorContrasena('La contraseña debe tener entre 8 y 72 caracteres.');
            return;
        }
        if (passwordNueva !== confirmacionContrasena) {
            setErrorContrasena('La confirmación no coincide con la nueva contraseña.');
            return;
        }

        setCambiandoContrasena(true);
        try {
            const respuesta = await cambiarContrasena({ passwordActual, passwordNueva });
            actualizarTokenSesion(respuesta.token);
            setPasswordActual('');
            setPasswordNueva('');
            setConfirmacionContrasena('');
            setMensajeExito(respuesta.mensaje || 'Tu contraseña se actualizó correctamente.');
        } catch (error: unknown) {
            console.error('No se pudo cambiar la contraseña:', error);
            setErrorContrasena(mensajeDeError(error));
        } finally {
            setCambiandoContrasena(false);
        }
    };

    return (
        <main className="perfil-page">
            <header className="perfil-page-header">
                <h1 className="perfil-title">Mi perfil</h1>
            </header>

            {mensajeExito && (
                <p role="status" className="perfil-feedback perfil-feedback--success">
                    {mensajeExito}
                </p>
            )}

            {cargando && (
                <SkeletonEstado etiqueta="Cargando perfil" className="perfil-loading-grid">
                    <div className="perfil-loading-column">
                        <Skeleton className="perfil-skeleton perfil-skeleton--profile" />
                        <Skeleton className="perfil-skeleton perfil-skeleton--password" />
                    </div>
                    <Skeleton className="perfil-skeleton perfil-skeleton--deactivation" />
                </SkeletonEstado>
            )}

            {errorCarga && !cargando && (
                <div role="alert" className="perfil-load-error">
                    <p>{errorCarga}</p>
                    <button
                        type="button"
                        onClick={() => setRecarga((valor) => valor + 1)}
                        className="perfil-button perfil-button--secondary perfil-retry-button"
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {perfil && !cargando && (
                <div className="perfil-layout">
                    <div className="perfil-column">
                        <section className="perfil-card perfil-card--identity">
                            <div className="perfil-card-accent" aria-hidden="true" />
                            <div className="perfil-card-content">
                                <header className="perfil-card-header">
                                    <div
                                        role="img"
                                        aria-label={`Avatar de ${perfil.nombre}`}
                                        className="perfil-avatar"
                                    >
                                        {inicialesNombre(perfil.nombre)}
                                    </div>
                                    <div className="perfil-identity">
                                        {!editando && (
                                            <h2 className="perfil-name">
                                                {perfil.nombre}
                                            </h2>
                                        )}
                                        <span className="perfil-role">
                                            {ETIQUETA_ROL[perfil.rol.toUpperCase()] ?? perfil.rol}
                                        </span>
                                    </div>
                                </header>

                                {editando ? (
                                    <form className="perfil-edit-form" onSubmit={guardarCambios}>
                                        <label htmlFor="perfil-nombre" className="perfil-label">
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
                                            className="perfil-input"
                                        />
                                        {errorGuardado && (
                                            <p role="alert" className="perfil-inline-error">
                                                {errorGuardado}
                                            </p>
                                        )}
                                        <div className="perfil-form-actions">
                                            <button
                                                type="submit"
                                                disabled={guardando}
                                                className="perfil-button perfil-button--primary"
                                            >
                                                {guardando ? 'Guardando…' : 'Guardar cambios'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelarEdicion}
                                                disabled={guardando}
                                                className="perfil-button perfil-button--secondary"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="perfil-details">
                                            <div className="perfil-detail">
                                                <p className="perfil-detail-label">
                                                    <Mail className="perfil-detail-icon" aria-hidden="true" />
                                                    Correo institucional
                                                </p>
                                                <p className="perfil-detail-value perfil-detail-value--email">{perfil.correo}</p>
                                            </div>
                                            <div className="perfil-detail">
                                                <p className="perfil-detail-label">
                                                    <CalendarDays className="perfil-detail-icon" aria-hidden="true" />
                                                    Miembro desde
                                                </p>
                                                <p className="perfil-detail-value">
                                                    {fechaRegistro(perfil.creadoEn)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={iniciarEdicion}
                                            className="perfil-button perfil-button--edit"
                                        >
                                            <Pencil className="perfil-button-icon" aria-hidden="true" />
                                            Editar información
                                        </button>
                                    </>
                                )}
                            </div>
                        </section>

                        <section className="perfil-card">
                            <div className="perfil-card-accent" aria-hidden="true" />
                            <div className="perfil-card-content">
                                <h2 className="perfil-section-title">
                                    <LockKeyhole className="perfil-section-icon" aria-hidden="true" />
                                    Cambiar contraseña
                                </h2>
                                <p className="perfil-section-description">
                                    Usa tu contraseña actual para confirmar el cambio.
                                </p>
                                <form className="perfil-password-form" onSubmit={guardarContrasena}>
                                    <div className="perfil-password-field">
                                        <label htmlFor="password-actual" className="perfil-label">
                                            Contraseña actual
                                        </label>
                                        <input
                                            id="password-actual"
                                            name="passwordActual"
                                            type="password"
                                            autoComplete="current-password"
                                            value={passwordActual}
                                            onChange={(evento) => setPasswordActual(evento.target.value)}
                                            required
                                            className="perfil-input"
                                            placeholder="Ingresa tu contraseña actual"
                                        />
                                    </div>
                                    <div className="perfil-password-field">
                                        <label htmlFor="password-nueva" className="perfil-label">
                                            Nueva contraseña
                                        </label>
                                        <input
                                            id="password-nueva"
                                            name="passwordNueva"
                                            type="password"
                                            autoComplete="new-password"
                                            value={passwordNueva}
                                            onChange={(evento) => setPasswordNueva(evento.target.value)}
                                            minLength={8}
                                            maxLength={72}
                                            required
                                            className="perfil-input"
                                            placeholder="Entre 8 y 72 caracteres"
                                        />
                                    </div>
                                    <div className="perfil-password-field">
                                        <label htmlFor="password-confirmacion" className="perfil-label">
                                            Confirmar nueva contraseña
                                        </label>
                                        <input
                                            id="password-confirmacion"
                                            name="confirmacionContrasena"
                                            type="password"
                                            autoComplete="new-password"
                                            value={confirmacionContrasena}
                                            onChange={(evento) => setConfirmacionContrasena(evento.target.value)}
                                            minLength={8}
                                            maxLength={72}
                                            required
                                            className="perfil-input"
                                            placeholder="Repite tu nueva contraseña"
                                        />
                                    </div>
                                    {errorContrasena && (
                                        <p role="alert" className="perfil-inline-error">
                                            {errorContrasena}
                                        </p>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={cambiandoContrasena}
                                        className="perfil-button perfil-button--primary perfil-password-submit"
                                    >
                                        {cambiandoContrasena ? 'Actualizando…' : 'Actualizar contraseña'}
                                    </button>
                                </form>
                            </div>
                        </section>
                    </div>

                    <section className="perfil-card">
                        <div className="perfil-card-accent" aria-hidden="true" />
                        <div className="perfil-card-content">
                            <h2 className="perfil-section-title">
                                <ShieldAlert className="perfil-section-icon perfil-section-icon--warning" aria-hidden="true" />
                                Desactivar cuenta
                            </h2>
                            <p className="perfil-section-description">
                                La gestión de desactivación de cuenta estará disponible en una próxima etapa.
                            </p>
                            <button
                                type="button"
                                disabled
                                className="perfil-button perfil-button--danger"
                            >
                                Desactivar mi cuenta
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
}
