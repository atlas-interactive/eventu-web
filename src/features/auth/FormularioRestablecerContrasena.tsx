import { EnlaceVolver } from '../../components/ui/EnlaceVolver';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useState, type SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IconoAviso } from '../../components/ui/IconoAviso';
import { mensajeDeError } from '../../api/mensajeDeError';
import '../../styles/auth.css';
import iconoEventU from '../../assets/icons/iconoEventU.png';
import { restablecerContrasena } from './services/authService';
import { validarLongitudContrasena } from './validacionAuth';

export function FormularioRestablecerContrasena() {
    const { t } = useTranslation();
    useDocumentTitle(`${t('auth.restablecer.titulo')} | EventU`);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token')?.trim() ?? '';
    const [password, setPassword] = useState('');
    const [confirmacion, setConfirmacion] = useState('');
    const [loading, setLoading] = useState(false);
    const [mensajeError, setMensajeError] = useState<string | null>(null);
    const passwordInvalida = password.length > 0 && !validarLongitudContrasena(password);
    const confirmacionInvalida = confirmacion.length > 0 && password !== confirmacion;

    const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMensajeError(null);

        if (!token) {
            setMensajeError(t('auth.restablecer.enlaceInvalido'));
            return;
        }
        if (!validarLongitudContrasena(password)) {
            setMensajeError(t('auth.restablecer.errorLongitud'));
            return;
        }
        if (password !== confirmacion) {
            setMensajeError(t('auth.restablecer.errorCoincidencia'));
            return;
        }

        setLoading(true);
        try {
            const respuesta = await restablecerContrasena({ token, password });
            navigate('/login', {
                replace: true,
                state: { mensajeRecuperacion: respuesta.mensaje },
            });
        } catch (error: unknown) {
            setMensajeError(mensajeDeError(error));
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <section className="register-form w-full max-w-[34rem] border-[0.125rem] px-5 py-6 sm:px-8">
                <header className="mb-3 text-center">
                    <img src={iconoEventU} alt="" aria-hidden="true" className="mx-auto mb-2 h-9 w-9" />
                    <p className="text-2xl font-semibold leading-5">Event<span className="text-eventu-institutional-red">U</span> </p>
                    <h1 className="mt-2 text-base font-semibold leading-7">{t('auth.restablecer.enlaceInvalidoTitulo')}</h1>
                </header>
                <div role="alert" className="register-alert-error mb-2 flex items-start gap-2 rounded border p-2 text-sm">
                    <IconoAviso tipo="error" className="mt-0.5 h-4 w-4" />
                    <span>{t('auth.restablecer.enlaceInvalido')}</span>
                </div>
                <p className="register-login-link text-center text-sm leading-5">
                    <EnlaceVolver to="/recuperar-contrasena">
                        {t('auth.restablecer.solicitarOtroCorreo')}
                    </EnlaceVolver>
                </p>
            </section>
        );
    }

    return (
        <section className="register-form w-full max-w-[34rem] border-[0.125rem] px-5 py-6 sm:px-8">
            <header className="mb-3 text-center">
                <img src={iconoEventU} alt="" aria-hidden="true" className="mx-auto mb-2 h-9 w-9" />
                <p className="text-2xl font-semibold leading-5">EventU</p>
                <h1 className="mt-2 text-base font-semibold leading-7">{t('auth.restablecer.titulo')}</h1>
                <p className="register-subtitle mt-0.5 text-sm leading-5">
                    {t('auth.restablecer.subtitulo')}
                </p>
            </header>

            {mensajeError && (
                <div role="alert" className="register-alert-error mb-2 flex items-start gap-2 rounded border p-2 text-sm">
                    <IconoAviso tipo="error" className="mt-0.5 h-4 w-4" />
                    <span>{mensajeError}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-1">
                <div>
                    <label htmlFor="password" className="register-label block text-sm font-medium leading-5">
                        {t('auth.restablecer.nuevaContrasena')}
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        aria-invalid={passwordInvalida || undefined}
                        className={`register-input mt-1 h-11 w-full rounded-md border px-2.5 text-base leading-6 outline-none${passwordInvalida ? ' register-input-invalid' : ''}`}
                        minLength={8}
                        maxLength={72}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="confirmacion" className="register-label block text-sm font-medium leading-5">
                        {t('auth.restablecer.confirmarContrasena')}
                    </label>
                    <input
                        type="password"
                        id="confirmacion"
                        name="confirmacion"
                        value={confirmacion}
                        onChange={(event) => setConfirmacion(event.target.value)}
                        aria-invalid={confirmacionInvalida || undefined}
                        className={`register-input mt-1 h-11 w-full rounded-md border px-2.5 text-base leading-6 outline-none${confirmacionInvalida ? ' register-input-invalid' : ''}`}
                        minLength={8}
                        maxLength={72}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="register-submit mt-1 h-11 w-full rounded-md text-base font-normal leading-6 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? t('auth.restablecer.actualizando') : t('auth.restablecer.restablecer')}
                </button>
            </form>

            {mensajeError && (
                <p className="register-login-link mt-2 text-center text-sm leading-5">
                    <EnlaceVolver to="/recuperar-contrasena">
                        {t('auth.restablecer.solicitarOtroCorreo')}
                    </EnlaceVolver>
                </p>
            )}
        </section>
    );
}
