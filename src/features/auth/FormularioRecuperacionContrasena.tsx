import { CampoAutenticacion } from './components/CampoAutenticacion';
import { CabeceraAutenticacion } from './components/CabeceraAutenticacion';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useState, type SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { IconoAviso } from '../../components/ui/IconoAviso';
import { mensajeDeError } from '../../api/mensajeDeError';
import '../../styles/auth.css';
import { validarCorreoInstitucional } from './validacionAuth';
import { solicitarRecuperacionContrasena } from './services/authService';

export function FormularioRecuperacionContrasena() {
    const { t } = useTranslation();
    useDocumentTitle(`${t('auth.recuperacion.titulo')} | EventU`);
    const [correo, setCorreo] = useState('');
    const [loading, setLoading] = useState(false);
    const [mensajeError, setMensajeError] = useState<string | null>(null);
    const [mensajeExito, setMensajeExito] = useState<string | null>(null);
    const correoNormalizado = correo.trim();
    const correoInvalido = correo.length > 0 && !validarCorreoInstitucional(correoNormalizado);

    const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMensajeError(null);
        setMensajeExito(null);

        if (!validarCorreoInstitucional(correoNormalizado)) {
            setMensajeError(t('auth.recuperacion.errorCorreo'));
            return;
        }

        setLoading(true);
        try {
            const respuesta = await solicitarRecuperacionContrasena({ correo: correoNormalizado });
            setMensajeExito(respuesta.mensaje);
        } catch (error: unknown) {
            setMensajeError(mensajeDeError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="register-form w-full max-w-[34rem] border-[0.125rem] px-5 py-6 sm:px-8">
            <CabeceraAutenticacion
                titulo={t('auth.recuperacion.titulo')}
                subtitulo={t('auth.recuperacion.subtitulo')}
            />

            {mensajeError && (
                <div role="alert" className="register-alert-error mb-2 flex items-start gap-2 rounded border p-2 text-sm">
                    <IconoAviso tipo="error" className="mt-0.5 h-4 w-4" />
                    <span>{mensajeError}</span>
                </div>
            )}

            {mensajeExito && (
                <div role="status" className="register-alert-success mb-2 flex items-start gap-2 rounded border p-2 text-sm">
                    <IconoAviso tipo="exito" className="mt-0.5 h-4 w-4" />
                    <span>{mensajeExito}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-1">
                <CampoAutenticacion
                    etiqueta={t('auth.recuperacion.correo')}
                    autoComplete="email"
                    type="email"
                    name="correo"
                    value={correo}
                    onChange={(event) => setCorreo(event.target.value)}
                    aria-invalid={correoInvalido || undefined}
                    placeholder={t('auth.recuperacion.placeholderCorreo')}
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="register-submit mt-1 h-11 w-full rounded-md text-base font-normal leading-6 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? t('auth.recuperacion.enviando') : t('auth.recuperacion.enviarEnlace')}
                </button>
            </form>

            <p className="register-login-link mt-2 text-center text-sm leading-5">
                <Link to="/login" className="link_form">
                    {t('auth.recuperacion.volverLogin')}
                </Link>
            </p>
        </section>
    );
}
