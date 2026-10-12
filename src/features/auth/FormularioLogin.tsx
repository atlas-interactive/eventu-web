import React, { useState } from 'react';
import { isAxiosError } from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import iconoEventU from '../../assets/icons/iconoEventU.png';
import { autenticarUsuario } from './services/authService';
import { esAdministrador, esOrganizador, guardarSesion } from '../sesion/sesion';
import type { AutenticacionDTO } from '../../types/auth';

const correoInstitucionalRegex = /^[a-zA-Z0-9._%+-]+@unillanos\.edu\.co$/;

export const FormularioLogin: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<AutenticacionDTO>({
        correo: '',
        password: '',
    });

    const [loading, setLoading] = useState(false);
    const [mensajeError, setMensajeError] = useState<string | null>(null);
    const [mensajeExito, setMensajeExito] = useState<string | null>(null);

    const campoInvalido = {
        correo: formData.correo.length > 0 && !correoInstitucionalRegex.test(formData.correo),
        password: formData.password.length > 0 && formData.password.length < 8,
    };

    const mostrarCampoInvalido = (campo: keyof AutenticacionDTO) =>
        formData[campo].length > 0 && campoInvalido[campo];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMensajeError(null);
        setMensajeExito(null);

        if (!correoInstitucionalRegex.test(formData.correo)) {
            setMensajeError('Debe ingresar un correo institucional válido.');
            return;
        }

        if (formData.password.length < 8 || formData.password.length > 72) {
            setMensajeError('La contraseña debe tener entre 8 y 72 caracteres.');
            return;
        }

        setLoading(true);

        try {
            const response = await autenticarUsuario(formData);
            // usuarioId llega tipado como bigint; en la sesión se guarda como número
            const sesion = { ...response, usuarioId: Number(response.usuarioId) };
            guardarSesion(sesion);
            setFormData({ correo: '', password: '' });

            if (esAdministrador(sesion)) {
                navigate('/admin/categorias', { replace: true });
                return;
            }
            if (esOrganizador(sesion)) {
                navigate('/organizador/eventos', { replace: true });
                return;
            }
            // Aún no hay pantalla de inicio para el rol USUARIO
            setMensajeExito(
                `Sesión iniciada${response.nombre ? `, ${response.nombre}` : ''}. El listado de eventos estará disponible en la próxima versión.`,
            );        } catch (err: unknown) {
            if (isAxiosError<{ error?: string }>(err) && err.response?.data.error) {
                setMensajeError(err.response.data.error);
            } else {
                setMensajeError('Ocurrió un error inesperado al conectar con el servidor.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="login-form register-form w-full max-w-[34rem] border-[0.125rem] px-8 py-6">
            <header className="mb-3 text-center">
                <img src={iconoEventU} alt="" aria-hidden="true" className="mx-auto mb-2 h-9 w-9" />
                <h1 className="text-2xl font-semibold leading-7">EventU</h1>
                <p className="mt-2 text-base font-semibold leading-5">Inicia sesión</p>
                <p className="register-subtitle mt-0.5 text-sm leading-5">Ingresa con tu correo institucional</p>
            </header>

            {mensajeError && (
                <div role="alert" className="register-alert-error mb-2 rounded border p-2 text-sm">
                    {mensajeError}
                </div>
            )}

            {mensajeExito && (
                <div role="status" className="register-alert-success mb-2 rounded border p-2 text-sm">
                    {mensajeExito}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-1">
                <div>
                    <label htmlFor="correo" className="register-label block text-sm font-medium leading-5">
                        Correo institucional
                    </label>
                    <input
                        type="email"
                        id="correo"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                        aria-invalid={mostrarCampoInvalido('correo') || undefined}
                        className={`register-input mt-1 h-11 w-full rounded-md border px-2.5 text-base leading-6 outline-none${mostrarCampoInvalido('correo') ? ' register-input-invalid' : ''}`}
                        placeholder="nombre@unillanos.edu.co"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password" className="register-label block text-sm font-medium leading-5">
                        Contraseña
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        aria-invalid={mostrarCampoInvalido('password') || undefined}
                        className={`register-input mt-1 h-11 w-full rounded-md border px-2.5 text-base leading-6 outline-none${mostrarCampoInvalido('password') ? ' register-input-invalid' : ''}`}
                        placeholder="Mínimo 8 caracteres"
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
                    {loading ? 'Validando...' : 'Iniciar sesión'}
                </button>
            </form>

            <p className="register-login-link mt-2 text-center text-sm leading-5">
                ¿No tienes cuenta?{' '}
                <Link to="/registro" className="font-medium hover:underline">
                    Regístrate
                </Link>
            </p>
        </section>
    );
};
