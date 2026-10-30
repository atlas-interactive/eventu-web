import React, { useState } from 'react';
import '../../styles/auth.css';
import { mensajeDeError } from '../../api/mensajeDeError';
import { Link, useNavigate } from 'react-router-dom';
import iconoEventU from '../../assets/icons/iconoEventU.png';
import { autenticarUsuario } from './services/authService';
import { obtenerRutaInicio, guardarSesion } from '../sesion/sesion';
import type { AutenticacionDTO } from '../../types/auth';

const correoInstitucionalRegex = /^[a-zA-Z0-9._%+-]+@unillanos\.edu\.co$/;

export const FormularioLogin: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<AutenticacionDTO>({
        correo: '',
        password: '',
    });

    // Estado de carga y mensajes del formulario
    const [loading, setLoading] = useState(false);
    const [mensajeError, setMensajeError] = useState<string | null>(null);
    const [mensajeExito, setMensajeExito] = useState<string | null>(null);

    // Validación del correo institucional y la contraseña
    const campoInvalido = {
        correo: formData.correo.length > 0 && !correoInstitucionalRegex.test(formData.correo),
        password: formData.password.length > 0 && formData.password.length < 8,
    };

    // Determina si el campo debe mostrarse como inválido
    const mostrarCampoInvalido = (campo: keyof AutenticacionDTO) =>
        formData[campo].length > 0 && campoInvalido[campo];

    // Actualiza el campo modificado sin alterar los demás valores
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Valida las credenciales y gestiona el inicio de sesión
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

            navigate(obtenerRutaInicio(sesion), { replace: true });

        } catch (err: unknown) {
            setMensajeError(mensajeDeError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="login-form register-form w-full max-w-[34rem] border-[0.125rem] px-5 py-6 sm:px-8">
            <header className="mb-3 text-center">
                <img src={iconoEventU} alt="" aria-hidden="true" className="mx-auto mb-2 h-9 w-9" />
                <p className="text-2xl font-semibold leading-5">EventU</p>
                <h1 className="mt-2 text-base font-semibold leading-7">Inicia sesión</h1>
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
