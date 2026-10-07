import React, { useState } from 'react';
import { isAxiosError } from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { autenticarUsuario } from './services/authService';
import { esAdministrador, guardarSesion } from '../sesion/sesion';
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
            // Aún no hay pantalla de inicio para los demás roles
            setMensajeExito(response.nombre || 'Inicio de sesión exitoso.');
        } catch (err: unknown) {
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
        <section className="login-form register-form w-full max-w-[26.25rem] border-[0.125rem] px-8 py-6">
            <header className="mb-3 text-center">
                <p className="text-[0.9375rem] font-semibold leading-[1.125rem]">EventU</p>
                <h1 className="mt-2 text-[0.875rem] font-semibold leading-[1.0625rem]">Inicia sesión</h1>
                <p className="register-subtitle mt-0.5 text-[0.625rem] leading-[0.75rem]">Ingresa con tu correo institucional</p>
            </header>

            {mensajeError && (
                <div role="alert" className="register-alert-error mb-2 rounded border p-2 text-xs">
                    {mensajeError}
                </div>
            )}

            {mensajeExito && (
                <div role="status" className="register-alert-success mb-2 rounded border p-2 text-xs">
                    {mensajeExito}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-1">
                <div>
                    <label htmlFor="correo" className="register-label block text-[0.625rem] font-medium leading-[0.8125rem]">
                        Correo institucional
                    </label>
                    <input
                        type="email"
                        id="correo"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                        aria-invalid={mostrarCampoInvalido('correo') || undefined}
                        className={`register-input mt-1 h-[1.9375rem] w-full rounded-md border px-2.5 text-[0.6875rem] outline-none${mostrarCampoInvalido('correo') ? ' register-input-invalid' : ''}`}
                        placeholder="nombre@unillanos.edu.co"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password" className="register-label block text-[0.625rem] font-medium leading-[0.8125rem]">
                        Contraseña
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        aria-invalid={mostrarCampoInvalido('password') || undefined}
                        className={`register-input mt-1 h-[1.9375rem] w-full rounded-md border px-2.5 text-[0.6875rem] outline-none${mostrarCampoInvalido('password') ? ' register-input-invalid' : ''}`}
                        placeholder="Mínimo 8 caracteres"
                        minLength={8}
                        maxLength={72}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="register-submit mt-1 h-[2.125rem] w-full rounded-md text-[0.75rem] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? 'Validando...' : 'Iniciar sesión'}
                </button>
            </form>

            <p className="register-login-link mt-2 text-center text-[0.625rem] leading-[0.75rem]">
                ¿No tienes cuenta?{' '}
                <Link to="/registro" className="font-medium hover:underline">
                    Regístrate
                </Link>
            </p>
        </section>
    );
};