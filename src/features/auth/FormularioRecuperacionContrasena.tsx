import { useState, type SubmitEvent } from 'react';
import { Link } from 'react-router-dom';
import { IconoAviso } from '../../components/ui/IconoAviso';
import { mensajeDeError } from '../../api/mensajeDeError';
import '../../styles/auth.css';
import iconoEventU from '../../assets/icons/iconoEventU.png';
import { validarCorreoInstitucional } from './validacionAuth';
import { solicitarRecuperacionContrasena } from './services/authService';

export function FormularioRecuperacionContrasena() {
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
            setMensajeError('Debe ingresar un correo institucional válido.');
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
            <header className="mb-3 text-center">
                <img src={iconoEventU} alt="" aria-hidden="true" className="mx-auto mb-2 h-9 w-9" />
                <p className="text-2xl font-semibold leading-5">Event<span className="text-eventu-institutional-red">U</span> </p>
                <h1 className="mt-2 text-base font-semibold leading-7">Recupera tu contraseña</h1>
                <p className="register-subtitle mt-0.5 text-sm leading-5">
                    Ingresa tu correo institucional y te enviaremos un enlace.
                </p>
            </header>

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
                <div>
                    <label htmlFor="correo" className="register-label block text-sm font-medium leading-5">
                        Correo institucional
                    </label>
                    <input
                        type="email"
                        id="correo"
                        name="correo"
                        value={correo}
                        onChange={(event) => setCorreo(event.target.value)}
                        aria-invalid={correoInvalido || undefined}
                        className={`register-input mt-1 h-11 w-full rounded-md border px-2.5 text-base leading-6 outline-none${correoInvalido ? ' register-input-invalid' : ''}`}
                        placeholder="nombre@unillanos.edu.co"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="register-submit mt-1 h-11 w-full rounded-md text-base font-normal leading-6 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? 'Enviando...' : 'Enviar enlace'}
                </button>
            </form>

            <p className="register-login-link mt-2 text-center text-sm leading-5">
                <Link to="/login" className="font-medium hover:underline">
                    Volver al inicio de sesión
                </Link>
            </p>
        </section>
    );
}
