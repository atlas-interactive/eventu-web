import { CabeceraAutenticacion } from './components/CabeceraAutenticacion';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useEffect, useRef, useState } from 'react';
import { MailCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { IconoAviso } from '../../components/ui/IconoAviso';
import { mensajeDeError } from '../../api/mensajeDeError';
import '../../styles/auth.css';
import { confirmarCorreo } from './services/authService';

type SolicitudConfirmacion = {
    token: string;
    promesa: ReturnType<typeof confirmarCorreo>;
};

export function ConfirmarCorreo() {
    const { t } = useTranslation();
    useDocumentTitle(`${t('auth.confirmacion.titulo')} | EventU`);
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token')?.trim() ?? '';
    const solicitudRef = useRef<SolicitudConfirmacion | null>(null);
    const [estado, setEstado] = useState<'procesando' | 'exito' | 'error'>(
        token ? 'procesando' : 'error',
    );
    const [mensajeExito, setMensajeExito] = useState<string | null>(null);
    const [mensajeError, setMensajeError] = useState<string | null>(
        token ? null : t('auth.confirmacion.enlaceInvalido'),
    );

    useEffect(() => {
        if (!token) return;

        if (!solicitudRef.current || solicitudRef.current.token !== token) {
            solicitudRef.current = { token, promesa: confirmarCorreo(token) };
        }
        const { promesa } = solicitudRef.current;

        void promesa
            .then((respuesta) => {
                if (solicitudRef.current?.promesa !== promesa) return;
                setMensajeExito(respuesta.mensaje || t('auth.confirmacion.exito'));
                setEstado('exito');
            })
            .catch((error: unknown) => {
                if (solicitudRef.current?.promesa !== promesa) return;
                setMensajeError(mensajeDeError(error));
                setEstado('error');
            });
    }, [token, t]);

    return (
        <section className="register-form w-full max-w-[34rem] border-[0.125rem] px-5 py-6 sm:px-8">
            <CabeceraAutenticacion
                titulo={t(token ? 'auth.confirmacion.titulo' : 'auth.confirmacion.enlaceInvalidoTitulo')}
                subtitulo={token ? t('auth.confirmacion.subtitulo') : undefined}
                icono={<MailCheck aria-hidden="true" className="mx-auto mt-3 h-9 w-9 text-eventu-institutional-red" />}
            />

            {estado === 'procesando' && (
                <p role="status" className="register-subtitle text-center text-sm">
                    {t('auth.confirmacion.procesando')}
                </p>
            )}

            {estado === 'exito' && mensajeExito && (
                <div role="status" className="register-alert-success mb-2 flex items-start gap-2 rounded border p-2 text-sm">
                    <IconoAviso tipo="exito" className="mt-0.5 h-4 w-4" />
                    <span>{mensajeExito}</span>
                </div>
            )}

            {estado === 'error' && mensajeError && (
                <div role="alert" className="register-alert-error mb-2 flex items-start gap-2 rounded border p-2 text-sm">
                    <IconoAviso tipo="error" className="mt-0.5 h-4 w-4" />
                    <span>{mensajeError}</span>
                </div>
            )}

            <p className="register-login-link mt-3 text-center text-sm leading-5">
                <Link to="/login" className="link_form">
                    {t('auth.confirmacion.volverLogin')}
                </Link>
            </p>
        </section>
    );
}
