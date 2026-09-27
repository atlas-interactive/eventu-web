import React, { useState } from 'react';
import { isAxiosError } from 'axios';
import { registerUser } from './services/authService';
import type { RegisterDTO } from '../../types/auth';

export const RegisterForm: React.FC = () => {
    const [formData, setFormData] = useState<RegisterDTO>({
        nombre: '',
        correo: '',
        password: '',
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            const response = await registerUser(formData);
            setSuccessMsg(response.message || 'Usuario registrado exitosamente.');
            setFormData({ nombre: '', correo: '', password: '' });
        } catch (err: unknown) {
            if (isAxiosError<{ error?: string }>(err) && err.response?.data.error) {
                setErrorMsg(err.response.data.error);
            } else {
                setErrorMsg('Ocurrió un error inesperado al conectar con el servidor.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-[328px] w-full max-w-[420px] border-2 border-sky-500 bg-white px-8 pb-2 pt-6 text-gray-900">
            <header className="mb-3 text-center">
                <p className="text-[15px] font-semibold leading-[18px]">EventU</p>
                <h1 className="mt-2 text-[14px] font-semibold leading-[17px]">Crea tu cuenta</h1>
                <p className="mt-0.5 text-[10px] leading-3 text-gray-500">Usa tu correo institucional para registrarte</p>
            </header>

            {/* Alerta visual de Error */}
            {errorMsg && (
                <div role="alert" className="mb-2 rounded border border-red-300 bg-red-50 p-2 text-xs text-red-700">
                    {errorMsg}
                </div>
            )}

            {/* Alerta visual de Éxito */}
            {successMsg && (
                <div role="status" className="mb-2 rounded border border-green-300 bg-green-50 p-2 text-xs text-green-700">
                    {successMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-1">
                <div>
                    <label htmlFor="nombre" className="block text-[10px] font-medium leading-[13px] text-gray-800">Nombre completo</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className="mt-1 h-[31px] w-full rounded-md border border-gray-200 px-2.5 text-[11px] text-gray-800 outline-none placeholder:text-gray-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        placeholder="Ej. Laura Gomez"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="correo" className="block text-[10px] font-medium leading-[13px] text-gray-800">Correo institucional</label>
                    <input
                        type="correo"
                        id="correo"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                        className="mt-1 h-[31px] w-full rounded-md border border-gray-200 px-2.5 text-[11px] text-gray-800 outline-none placeholder:text-gray-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        placeholder="nombre@unillanos.edu.co"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-[10px] font-medium leading-[13px] text-gray-800">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="mt-1 h-[31px] w-full rounded-md border border-gray-200 px-2.5 text-[11px] text-gray-800 outline-none placeholder:text-gray-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        placeholder="Mínimo 8 caracteres"
                        minLength={8}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 h-[34px] w-full rounded-md bg-[#b51221] text-[12px] font-semibold text-white transition-colors hover:bg-[#970f1b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b51221] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? 'Validando...' : 'Crear cuenta'}
                </button>
            </form>
            <p className="mt-2 text-center text-[10px] leading-3 text-[#b51221]">
                ¿Ya tienes cuenta? <a href="/login" className="font-medium hover:underline">Inicia sesión</a>
            </p>
        </section>
    );
};

