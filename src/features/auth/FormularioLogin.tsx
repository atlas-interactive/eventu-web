import React, { useEffect, useState } from 'react';
import { IconoAviso } from '../../components/ui/IconoAviso';
import '../../styles/auth.css';
import { mensajeDeError } from '../../api/mensajeDeError';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import iconoEventU from '../../assets/icons/iconoEventU.png';
import { autenticarUsuario } from './services/authService';
import { obtenerRutaInicio, guardarSesion } from '../sesion/sesion';
import { ModalAccesible } from '../../components/ui/ModalAccesible';
import type { AutenticacionDTO, RespuestaAutenticacion } from '../../types/auth';

const correoInstitucionalRegex = /^[a-zA-Z0-9._%+-]+@unillanos\.edu\.co$/;

export const FormularioLogin: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const mensajeRecuperacion =
        location.state &&
        typeof location.state === 'object' &&
        'mensajeRecuperacion' in location.state &&
        typeof location.state.mensajeRecuperacion === 'string'
            ? location.state.mensajeRecuperacion
            : null;
    const mensajeCuentaDesactivada =
        location.state &&
        typeof location.state === 'object' &&
        'mensajeCuentaDesactivada' in location.state &&
        typeof location.state.mensajeCuentaDesactivada === 'string'
            ? location.state.mensajeCuentaDesactivada
            : null;
    const mensajeNavegacion = mensajeCuentaDesactivada ?? mensajeRecuperacion;
    const [formData, setFormData] = useState<AutenticacionDTO>({
        correo: '',
        password: '',
    });

    // Estado de carga y mensajes del formulario
    const [loading, setLoading] = useState(false);
    const [mensajeError, setMensajeError] = useState<string | null>(null);
    const [mensajeExito, setMensajeExito] = useState<string | null>(mensajeNavegacion);
    const [respuestaPendiente, setRespuestaPendiente] = useState<RespuestaAutenticacion | null>(null);

    useEffect(() => {
        if (mensajeNavegacion) {
            navigate('/login', { replace: true, state: null });
        }
    }, [mensajeNavegacion, navigate]);

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

    const continuarConSesion = (response: RespuestaAutenticacion) => {
        const sesion = {
            usuarioId: Number(response.usuarioId),
            nombre: response.nombre,
            correo: response.correo,
            rol: response.rol,
        };
        guardarSesion({ token: response.token, ...sesion });
        setFormData({ correo: '', password: '' });
        navigate(obtenerRutaInicio(sesion), { replace: true });
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
            if (response.cuentaReactivada) {
                setRespuestaPendiente(response);
            } else {
                continuarConSesion(response);
            }

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
                <p className="text-2xl font-semibold leading-5">Event<span className="text-eventu-institutional-red">U</span> </p>
                <h1 className="mt-2 text-base font-semibold leading-7">Inicia sesión</h1>
                <p className="register-subtitle mt-0.5 text-sm leading-5">Ingresa con tu correo institucional</p>
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
                <Link to="/registro" className="font-medium link_form hover:link_form-hover">
                    Regístrate
                </Link>
            </p>

            <p className="register-login-link mt-2 text-center text-sm leading-5">
                <Link to="/recuperar-contrasena" className="font-medium link_form hover:link_form-hover">
                    ¿Olvidaste tu contraseña?
                </Link>
            </p>

            {respuestaPendiente && (
                <ModalAccesible
                    titulo="Cuenta reactivada"
                    idTitulo="titulo-cuenta-reactivada"
                    onCerrar={() => continuarConSesion(respuestaPendiente)}
                    icono={<IconoAviso tipo="exito" className="h-6 w-6" />}
                >
                    <p className="workflow-dialog-copy">
                        Tu cuenta ha sido reactivada correctamente. Puedes continuar a EventU.
                    </p>
                    <div className="workflow-dialog-actions">
                        <button
                            type="button"
                            className="workflow-button workflow-button--primary"
                            onClick={() => continuarConSesion(respuestaPendiente)}
                        >
                            Continuar
                        </button>
                    </div>
                </ModalAccesible>
            )}
        </section>
    );
};
