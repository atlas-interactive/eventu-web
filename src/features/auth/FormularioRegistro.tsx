import React, { useState } from 'react';
import { isAxiosError } from 'axios';
import { registrarUsuario } from './services/authService';
import type { RegistroDTO } from '../../types/auth';

export const FormularioRegistro: React.FC = () => {
    const [formData, setFormData] = useState<RegistroDTO>({
        nombre: '',
        correo: '',
        password: '',
    });

    // Estado para manejar la carga y los mensajes de error/éxito
    const [loading, setLoading] = useState<boolean>(false);
    const [mensajeError, setMensajeError] = useState<string | null>(null);
    const [mensajeExito, setMensajeExito] = useState<string | null>(null);

    // Maneja los cambios en los campos del formulario
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Maneja el envío del formulario
    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMensajeError(null);
        setMensajeExito(null);

        try {
            const response = await registrarUsuario(formData);
            setMensajeExito(response.mensaje || 'Usuario registrado exitosamente.');
            setFormData({ nombre: '', correo: '', password: '' });
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
        <section className="register-form min-h-[20.5rem] w-full max-w-[26.25rem] border-[0.125rem] px-8 pb-2 pt-6">
            <header className="mb-3 text-center">
            <p className="text-[0.9375rem] font-semibold leading-[1.125rem]">EventU</p>
            <h1 className="mt-2 text-[0.875rem] font-semibold leading-[1.0625rem]">Crea tu cuenta</h1>
            <p className="register-subtitle mt-0.5 text-[0.625rem] leading-[0.75rem]">Usa tu correo institucional para registrarte</p>
            </header>

            {/* Alerta visual de Error */}
            {mensajeError && (
                <div role="alert" className="register-alert-error mb-2 rounded border p-2 text-xs">
                    {mensajeError}
                </div>
            )}

            {/* Alerta visual de Éxito */}
            {mensajeExito && (
                <div role="status" className="register-alert-success mb-2 rounded border p-2 text-xs">
                    {mensajeExito}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-1">
                <div>
                    <label htmlFor="nombre" className="register-label block text-[0.625rem] font-medium leading-[0.8125rem]">Nombre completo</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className="register-input mt-1 h-[1.9375rem] w-full rounded-md border px-2.5 text-[0.6875rem] outline-none"
                        placeholder="Ej. Laura Gomez"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="correo" className="register-label block text-[0.625rem] font-medium leading-[0.8125rem]">Correo institucional</label>
                    <input
                        type="email"
                        id="correo"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                        className="register-input mt-1 h-[1.9375rem] w-full rounded-md border px-2.5 text-[0.6875rem] outline-none"
                        placeholder="nombre@unillanos.edu.co"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password" className="register-label block text-[0.625rem] font-medium leading-[0.8125rem]">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="register-input mt-1 h-[1.9375rem] w-full rounded-md border px-2.5 text-[0.6875rem] outline-none"
                        placeholder="Mínimo 8 caracteres"
                        minLength={8}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="register-submit mt-1 h-[2.125rem] w-full rounded-md text-[0.75rem] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? 'Validando...' : 'Crear cuenta'}
                </button>
            </form>
            <p className="register-login-link mt-2 text-center text-[0.625rem] leading-[0.75rem]">
                ¿Ya tienes cuenta? <a href="/login" className="font-medium hover:underline">Inicia sesión</a>
            </p>
        </section>
    );
};

