import { CampoAutenticacion } from './components/CampoAutenticacion';
import { CabeceraAutenticacion } from './components/CabeceraAutenticacion';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import React, { useState } from 'react';
import type { ChangeEvent, SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { IconoAviso } from '../../components/ui/IconoAviso';
import '../../styles/auth.css';
import { mensajeDeError } from '../../api/mensajeDeError';
import { validarCorreoInstitucional, validarLongitudContrasena } from './validacionAuth';
import { Link } from 'react-router-dom';
import { registrarUsuario } from './services/authService';
import type { RegistroDTO } from '../../types/auth';

export const FormularioRegistro: React.FC = () => {
    const { t } = useTranslation();
    useDocumentTitle(`${t('auth.registro.titulo')} | EventU`);
    const [formData, setFormData] = useState<RegistroDTO>({
        nombre: '',
        correo: '',
        password: '',
    });

    // Estado para manejar la carga y los mensajes de error/éxito
    const [loading, setLoading] = useState<boolean>(false);
    const [mensajeError, setMensajeError] = useState<string | null>(null);
    const [mensajeExito, setMensajeExito] = useState<string | null>(null);

    // Validación de campos del formulario
    const campoInvalido = {
        nombre: formData.nombre.trim().length === 0,
        correo: !validarCorreoInstitucional(formData.correo),
        password: !validarLongitudContrasena(formData.password),
    };

    // Función para determinar si un campo debe mostrar un estado de error
    const mostrarCampoInvalido = (campo: keyof RegistroDTO) =>
        formData[campo].length > 0 && campoInvalido[campo];

    // Maneja los cambios en los campos del formulario
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Maneja el envío del formulario
    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMensajeError(null);
        setMensajeExito(null);

        if (!validarCorreoInstitucional(formData.correo)) {
            setMensajeError(t('auth.registro.errorCorreo'));
            return;
        }

        if (!validarLongitudContrasena(formData.password)) {
            setMensajeError(t('auth.registro.errorContrasena'));
            return;
        }

        setLoading(true);

        try {
            const response = await registrarUsuario(formData);
            setMensajeExito(
                response.confirmacionPendiente
                    ? t('auth.registro.confirmacionPendiente', { correo: formData.correo })
                    : response.mensaje || t('auth.registro.exito'),
            );
            setFormData({ nombre: '', correo: '', password: '' });
        } catch (err: unknown) {
            setMensajeError(mensajeDeError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="register-form w-full max-w-[34rem] border-[0.125rem] px-5 py-6 sm:px-8">
            <CabeceraAutenticacion
                titulo={t('auth.registro.titulo')}
                subtitulo={t('auth.registro.subtitulo')}
                claseSubtitulo="leading-7"
            />

            {/* Alerta visual de Error */}
            {mensajeError && (
                <div role="alert" className="register-alert-error mb-2 flex items-start gap-2 rounded border p-2 text-sm">
                    <IconoAviso tipo="error" className="mt-0.5 h-4 w-4" />
                    <span>{mensajeError}</span>
                </div>
            )}

            {/* Alerta visual de Éxito */}
            {mensajeExito && (
                <div role="status" className="register-alert-success mb-2 flex items-start gap-2 rounded border p-2 text-sm">
                    <IconoAviso tipo="exito" className="mt-0.5 h-4 w-4" />
                    <span>{mensajeExito}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-1">
                <CampoAutenticacion
                    etiqueta={t('auth.registro.nombre')}
                    autoComplete="name"
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    aria-invalid={mostrarCampoInvalido('nombre') || undefined}
                    placeholder={t('auth.registro.placeholderNombre')}
                    required
                />

                <CampoAutenticacion
                    etiqueta={t('auth.registro.correo')}
                    autoComplete="email"
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    aria-invalid={mostrarCampoInvalido('correo') || undefined}
                    placeholder={t('auth.registro.placeholderCorreo')}
                    required
                />

                <CampoAutenticacion
                    etiqueta={t('auth.registro.contrasena')}
                    autoComplete="new-password"
                    type="password"
                    permitirMostrarContrasena
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    aria-invalid={mostrarCampoInvalido('password') || undefined}
                    placeholder={t('auth.registro.placeholderContrasena')}
                    minLength={8}
                    maxLength={72}
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="register-submit mt-1 h-11 w-full rounded-md text-base font-normal leading-6 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? t('auth.registro.validando') : t('auth.registro.crearCuenta')}
                </button>
            </form>
            <p className="register-login-link mt-2 text-center text-sm leading-5">
                {t('auth.registro.yaTienesCuenta')}{' '}
                <Link to="/login" className="link_form">
                    {t('auth.registro.iniciaSesion')}
                </Link>
            </p>
        </section>
    );
};
