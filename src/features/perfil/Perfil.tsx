import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useEffect, useState } from 'react';
import type { SubmitEvent } from 'react';
import { CalendarDays, KeyRound, Mail, Pencil, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { useNavigate } from 'react-router-dom';
import { mensajeDeError } from '../../api/mensajeDeError';
import { ModalAccesible } from '../../components/ui/ModalAccesible';
import { InputContrasena } from '../../components/ui/InputContrasena';
import { Skeleton, SkeletonEstado } from '../../components/ui/Skeleton';
import { actualizarNombreSesion, actualizarTokenSesion, cerrarSesion } from '../sesion/sesion';
import {
    actualizarPerfil,
    cambiarContrasena,
    desactivarCuenta,
    obtenerPerfil,
} from './services/perfilService';
import type { PerfilUsuario } from '../../types/perfil';
import '../../styles/perfil.css';

const CLAVE_ROL: Record<string, string> = {
    ADMIN: 'comun.roles.admin',
    ORGANIZADOR: 'comun.roles.organizador',
    USUARIO: 'comun.roles.usuario',
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
    if (!fecha) return i18n.t('perfil.noDisponible');
    const valor = new Date(fecha);
    if (Number.isNaN(valor.getTime())) return i18n.t('perfil.noDisponible');
    return new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }).format(valor);
};

export function Perfil() {
    const { t } = useTranslation();
    useDocumentTitle(`${t('perfil.titulo')} | EventU`);
    const navigate = useNavigate();
    const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
    const [recarga, setRecarga] = useState(0);
    const [resultadoCarga, setResultadoCarga] = useState<{ recarga: number; error: string } | null>(null);
    const cargando = resultadoCarga?.recarga !== recarga;
    const errorCarga = resultadoCarga?.recarga === recarga ? resultadoCarga.error : '';
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
    const [modalDesactivacionAbierto, setModalDesactivacionAbierto] = useState(false);
    const [passwordDesactivacion, setPasswordDesactivacion] = useState('');
    const [desactivandoCuenta, setDesactivandoCuenta] = useState(false);
    const [errorDesactivacion, setErrorDesactivacion] = useState('');

    useEffect(() => {
        let vigente = true;
        obtenerPerfil()
            .then((datos) => {
                if (!vigente) return;
                setPerfil(datos);
                setResultadoCarga({ recarga, error: '' });
            })
            .catch((error: unknown) => {
                console.error('No se pudo cargar el perfil:', error);
                if (vigente) {
                    setResultadoCarga({ recarga, error: mensajeDeError(error) });
                }
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

    const guardarCambios = async (evento: SubmitEvent<HTMLFormElement>) => {
        evento.preventDefault();
        if (!perfil) return;

        const nombre = nombreEditado.trim();
        if (!nombre) {
            setErrorGuardado(t('perfil.errorNombreObligatorio'));
            return;
        }
        if (nombre.length > 100) {
            setErrorGuardado(t('perfil.errorNombreMaximo'));
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
            setMensajeExito(t('perfil.exitoActualizacion'));
        } catch (error: unknown) {
            console.error('No se pudo actualizar el perfil:', error);
            setErrorGuardado(mensajeDeError(error));
        } finally {
            setGuardando(false);
        }
    };

    const guardarContrasena = async (evento: SubmitEvent<HTMLFormElement>) => {
        evento.preventDefault();
        setErrorContrasena('');
        setMensajeExito('');

        if (passwordNueva.length < 8 || passwordNueva.length > 72) {
            setErrorContrasena(t('perfil.errorContrasenaLongitud'));
            return;
        }
        if (passwordNueva !== confirmacionContrasena) {
            setErrorContrasena(t('perfil.errorContrasenaCoincidencia'));
            return;
        }

        setCambiandoContrasena(true);
        try {
            const respuesta = await cambiarContrasena({ passwordActual, passwordNueva });
            actualizarTokenSesion(respuesta.token);
            setPasswordActual('');
            setPasswordNueva('');
            setConfirmacionContrasena('');
            setMensajeExito(respuesta.mensaje || t('perfil.exitoContrasena'));
        } catch (error: unknown) {
            console.error('No se pudo cambiar la contraseña:', error);
            setErrorContrasena(mensajeDeError(error));
        } finally {
            setCambiandoContrasena(false);
        }
    };

    const abrirModalDesactivacion = () => {
        setPasswordDesactivacion('');
        setErrorDesactivacion('');
        setModalDesactivacionAbierto(true);
    };

    const cerrarModalDesactivacion = () => {
        if (desactivandoCuenta) return;
        setModalDesactivacionAbierto(false);
        setPasswordDesactivacion('');
        setErrorDesactivacion('');
    };

    const confirmarDesactivacion = async (evento: SubmitEvent<HTMLFormElement>) => {
        evento.preventDefault();
        if (desactivandoCuenta || !passwordDesactivacion.trim()) {
            setErrorDesactivacion(t('perfil.errorPasswordDesactivacion'));
            return;
        }

        setDesactivandoCuenta(true);
        setErrorDesactivacion('');
        try {
            const respuesta = await desactivarCuenta(passwordDesactivacion);
            cerrarSesion();
            navigate('/login', {
                replace: true,
                state: { mensajeCuentaDesactivada: respuesta.mensaje },
            });
        } catch (error: unknown) {
            console.error('No se pudo desactivar la cuenta:', error);
            setPasswordDesactivacion('');
            setErrorDesactivacion(mensajeDeError(error));
        } finally {
            setDesactivandoCuenta(false);
        }
    };

    return (
        <main className="perfil-page">
            <header className="perfil-page-header">
                <h1 className="perfil-title">{t('perfil.titulo')}</h1>
            </header>

            {mensajeExito && (
                <p role="status" className="perfil-feedback perfil-feedback--success">
                    {mensajeExito}
                </p>
            )}

            {cargando && (
                <SkeletonEstado etiqueta={t('perfil.cargando')} className="perfil-loading-grid">
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
                        {t('perfil.reintentar')}
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
                                        aria-label={t('perfil.avatar', { nombre: perfil.nombre })}
                                        className="perfil-avatar"
                                    >
                                        {inicialesNombre(perfil.nombre)}
                                    </div>
                                    <div className="perfil-identity">
                                        <h2 className={editando ? 'sr-only' : 'perfil-name'}>
                                            {perfil.nombre}
                                        </h2>
                                        <span className="perfil-role">
                                            {CLAVE_ROL[perfil.rol.toUpperCase()]
                                                ? t(CLAVE_ROL[perfil.rol.toUpperCase()])
                                                : perfil.rol}
                                        </span>
                                    </div>
                                </header>

                                {editando ? (
                                    <form className="perfil-edit-form" onSubmit={guardarCambios}>
                                        <label htmlFor="perfil-nombre" className="perfil-label">
                                            {t('perfil.nombreCompleto')}
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
                                                {guardando ? t('perfil.guardando') : t('perfil.guardarCambios')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelarEdicion}
                                                disabled={guardando}
                                                className="perfil-button perfil-button--secondary"
                                            >
                                                {t('perfil.cancelar')}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <dl className="perfil-details">
                                            <div className="perfil-detail">
                                                <dt className="perfil-detail-label">
                                                    <Mail className="perfil-detail-icon" aria-hidden="true" />
                                                    {t('perfil.correo')}
                                                </dt>
                                                <dd className="perfil-detail-value perfil-detail-value--email">{perfil.correo}</dd>
                                            </div>
                                            <div className="perfil-detail">
                                                <dt className="perfil-detail-label">
                                                    <CalendarDays className="perfil-detail-icon" aria-hidden="true" />
                                                    {t('perfil.miembroDesde')}
                                                </dt>
                                                <dd className="perfil-detail-value">
                                                    {perfil.creadoEn && !Number.isNaN(new Date(perfil.creadoEn).getTime()) ? (
                                                        <time dateTime={perfil.creadoEn}>{fechaRegistro(perfil.creadoEn)}</time>
                                                    ) : fechaRegistro(perfil.creadoEn)}
                                                </dd>
                                            </div>
                                        </dl>
                                        <button
                                            type="button"
                                            onClick={iniciarEdicion}
                                            className="perfil-button perfil-button--edit"
                                        >
                                            <Pencil className="perfil-button-icon" aria-hidden="true" />
                                            {t('perfil.editarInformacion')}
                                        </button>
                                    </>
                                )}
                            </div>
                        </section>
                        <section className="perfil-card">
                            <div className="perfil-card-accent" aria-hidden="true" />
                            <div className="perfil-card-content">
                                <h2 className="perfil-section-title">
                                    <ShieldAlert className="perfil-section-icon perfil-section-icon--warning" aria-hidden="true" />
                                    {t('perfil.desactivarCuenta')}
                                </h2>
                                <p className="perfil-section-description">
                                    {t('perfil.desactivarDescripcion')}
                                </p>
                                <ul className="perfil-restricciones-desactivacion">
                                    <li>
                                        {t('perfil.restriccionAdmin')}
                                    </li>
                                    <li>
                                        {t('perfil.restriccionOrganizador')}
                                    </li>
                                    <li>
                                        {t('perfil.restriccionInscripciones')}
                                    </li>
                                </ul>
                                <button
                                    type="button"
                                    onClick={abrirModalDesactivacion}
                                    className="perfil-button perfil-button--danger"
                                >
                                    {t('perfil.desactivarMiCuenta')}
                                </button>
                            </div>
                        </section>
                    </div>

                    <section className="perfil-card">
                        <div className="perfil-card-accent" aria-hidden="true" />
                        <div className="perfil-card-content">
                            <h2 className="perfil-section-title">
                                <KeyRound className="perfil-section-icon" aria-hidden="true" />
                                {t('perfil.cambiarContrasena')}
                            </h2>
                            <p className="perfil-section-description">
                                {t('perfil.cambiarDescripcion')}
                            </p>
                            <form className="perfil-password-form" onSubmit={guardarContrasena}>
                                <div className="perfil-password-field">
                                    <label htmlFor="password-actual" className="perfil-label">
                                        {t('perfil.contrasenaActual')}
                                    </label>
                                    <InputContrasena
                                        id="password-actual"
                                        name="passwordActual"
                                        autoComplete="current-password"
                                        value={passwordActual}
                                        onChange={(evento) => setPasswordActual(evento.target.value)}
                                        required
                                        className="perfil-input"
                                        placeholder={t('perfil.placeholderContrasenaActual')}
                                    />
                                </div>
                                <div className="perfil-password-field">
                                    <label htmlFor="password-nueva" className="perfil-label">
                                        {t('perfil.nuevaContrasena')}
                                    </label>
                                    <InputContrasena
                                        id="password-nueva"
                                        name="passwordNueva"
                                        autoComplete="new-password"
                                        value={passwordNueva}
                                        onChange={(evento) => setPasswordNueva(evento.target.value)}
                                        minLength={8}
                                        maxLength={72}
                                        required
                                        className="perfil-input"
                                        placeholder={t('perfil.placeholderNuevaContrasena')}
                                    />
                                </div>
                                <div className="perfil-password-field">
                                    <label htmlFor="password-confirmacion" className="perfil-label">
                                        {t('perfil.confirmarNuevaContrasena')}
                                    </label>
                                    <InputContrasena
                                        id="password-confirmacion"
                                        name="confirmacionContrasena"
                                        autoComplete="new-password"
                                        value={confirmacionContrasena}
                                        onChange={(evento) => setConfirmacionContrasena(evento.target.value)}
                                        minLength={8}
                                        maxLength={72}
                                        required
                                        className="perfil-input"
                                        placeholder={t('perfil.placeholderConfirmarContrasena')}
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
                                    {cambiandoContrasena ? t('perfil.actualizando') : t('perfil.actualizarContrasena')}
                                </button>
                            </form>
                        </div>
                    </section>
                </div>
            )}
            {modalDesactivacionAbierto && (
                <ModalAccesible
                    titulo={t('perfil.confirmarDesactivacionTitulo')}
                    idTitulo="titulo-desactivar-cuenta"
                    onCerrar={cerrarModalDesactivacion}
                    icono={<ShieldAlert className="perfil-section-icon perfil-section-icon--warning" aria-hidden="true" />}
                >
                    <p className="workflow-dialog-copy">
                        {t('perfil.confirmarDesactivacionMensaje')}
                    </p>
                    <form className="perfil-desactivacion-form" onSubmit={confirmarDesactivacion}>
                        <label htmlFor="password-desactivacion" className="perfil-label">
                            {t('perfil.contrasenaActual')}
                        </label>
                        <input
                            id="password-desactivacion"
                            name="passwordDesactivacion"
                            type="password"
                            autoComplete="current-password"
                            value={passwordDesactivacion}
                            onChange={(evento) => setPasswordDesactivacion(evento.target.value)}
                            required
                            autoFocus
                            disabled={desactivandoCuenta}
                            className="perfil-input"
                        />
                        {errorDesactivacion && (
                            <p role="alert" className="perfil-inline-error">
                                {errorDesactivacion}
                            </p>
                        )}
                        <div className="workflow-dialog-actions">
                            <button
                                type="button"
                                className="workflow-button workflow-button--secondary"
                                onClick={cerrarModalDesactivacion}
                                disabled={desactivandoCuenta}
                            >
                                {t('perfil.volver')}
                            </button>
                            <button
                                type="submit"
                                className="workflow-button workflow-button--primary"
                                disabled={desactivandoCuenta || !passwordDesactivacion.trim()}
                            >
                                {desactivandoCuenta ? t('perfil.desactivando') : t('perfil.confirmarDesactivacion')}
                            </button>
                        </div>
                    </form>
                </ModalAccesible>
            )}
        </main>
    );
}
