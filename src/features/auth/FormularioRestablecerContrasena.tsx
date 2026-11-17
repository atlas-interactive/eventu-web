import { CampoAutenticacion } from './components/CampoAutenticacion';
import { CabeceraAutenticacion } from './components/CabeceraAutenticacion';
import { EnlaceVolver } from '../../components/ui/EnlaceVolver';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useState, type SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IconoAviso } from '../../components/ui/IconoAviso';
import { mensajeDeError } from '../../api/mensajeDeError';
import '../../styles/auth.css';
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
                <CabeceraAutenticacion titulo={t('auth.restablecer.enlaceInvalidoTitulo')} />
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
            <CabeceraAutenticacion
                titulo={t('auth.restablecer.titulo')}
                subtitulo={t('auth.restablecer.subtitulo')}
            />

            {mensajeError && (
                <div role="alert" className="register-alert-error mb-2 flex items-start gap-2 rounded border p-2 text-sm">
                    <IconoAviso tipo="error" className="mt-0.5 h-4 w-4" />
                    <span>{mensajeError}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-1">
                <CampoAutenticacion
                    etiqueta={t('auth.restablecer.nuevaContrasena')}
                    autoComplete="new-password"
                    type="password"
                    name="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    aria-invalid={passwordInvalida || undefined}
                    minLength={8}
                    maxLength={72}
                    required
                />

                <CampoAutenticacion
                    etiqueta={t('auth.restablecer.confirmarContrasena')}
                    autoComplete="new-password"
                    type="password"
                    name="confirmacion"
                    value={confirmacion}
                    onChange={(event) => setConfirmacion(event.target.value)}
                    aria-invalid={confirmacionInvalida || undefined}
                    minLength={8}
                    maxLength={72}
                    required
                />

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
