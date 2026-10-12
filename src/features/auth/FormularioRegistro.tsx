import React, { useState } from 'react';
import { isAxiosError } from 'axios';
import { Link } from 'react-router-dom';
import iconoEventU from '../../assets/icons/iconoEventU.png';
import { registrarUsuario } from './services/authService';
import type { RegistroDTO } from '../../types/auth';

const correoInstitucionalRegex = /^[a-zA-Z0-9._%+-]+@unillanos\.edu\.co$/;

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

    // Validación de campos del formulario
    const campoInvalido = {
        nombre: formData.nombre.trim().length === 0,
        correo: !correoInstitucionalRegex.test(formData.correo),
        password: formData.password.length < 8 || formData.password.length > 72,
    };

    // Función para determinar si un campo debe mostrar un estado de error
    const mostrarCampoInvalido = (campo: keyof RegistroDTO) =>
        formData[campo].length > 0 && campoInvalido[campo];

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
        setMensajeError(null);
        setMensajeExito(null);

        if (!correoInstitucionalRegex.test(formData.correo)) {
            setMensajeError('Debe ingresar un correo institucional educativo válido.');
            return;
        }

        if (formData.password.length < 8 || formData.password.length > 72) {
            setMensajeError('La contraseña debe tener entre 8 y 72 caracteres.');
            return;
        }

        setLoading(true);

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
        <section className="register-form w-full max-w-[34rem] border-[0.125rem] px-8 py-6">
            <header className="mb-3 text-center">
                <img src={iconoEventU} alt="" aria-hidden="true" className="mx-auto mb-2 h-9 w-9" />
                <h1 className="text-2xl font-semibold leading-7">EventU</h1>
                <p className="mt-2 text-base font-semibold leading-5">Crea tu cuenta</p>
                <p className="register-subtitle mt-0.5 text-sm leading-7">Usa tu correo institucional para registrarte</p>
            </header>

            {/* Alerta visual de Error */}
            {mensajeError && (
                <div role="alert" className="register-alert-error mb-2 rounded border p-2 text-sm">
                    {mensajeError}
                </div>
            )}

            {/* Alerta visual de Éxito */}
            {mensajeExito && (
                <div role="status" className="register-alert-success mb-2 rounded border p-2 text-sm">
                    {mensajeExito}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-1">
                <div>
                    <label htmlFor="nombre" className="register-label block text-sm font-medium leading-5">Nombre completo</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        aria-invalid={mostrarCampoInvalido('nombre') || undefined}
                        className={`register-input mt-1 h-11 w-full rounded-md border px-2.5 text-base leading-6 outline-none${mostrarCampoInvalido('nombre') ? ' register-input-invalid' : ''}`}
                        placeholder="Ej. Laura Gomez"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="correo" className="register-label block text-sm font-medium leading-5">Correo institucional</label>
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
                    <label htmlFor="password" className="register-label block text-sm font-medium leading-5">Contraseña</label>
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
                    {loading ? 'Validando...' : 'Crear cuenta'}
                </button>
            </form>
            <p className="register-login-link mt-2 text-center text-sm leading-5">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="font-medium hover:underline">
                    Inicia sesión
                </Link>
            </p>
        </section>
    );
};
