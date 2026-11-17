import { useId, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CampoAutenticacionProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'children'> {
    etiqueta: string;
    ayuda?: string;
    error?: string;
    permitirMostrarContrasena?: boolean;
}

// Conserva los atributos nativos; únicamente comparte presentación y asociaciones accesibles.
export function CampoAutenticacion({
    etiqueta,
    ayuda,
    error,
    permitirMostrarContrasena = false,
    type,
    disabled,
    id,
    className = '',
    'aria-describedby': descripcionExterna,
    'aria-invalid': invalido,
    ...props
}: CampoAutenticacionProps) {
    const idGenerado = useId();
    const { t } = useTranslation();
    const [contrasenaVisible, setContrasenaVisible] = useState(false);
    const puedeAlternar = permitirMostrarContrasena && type === 'password';
    const etiquetaVisibilidad = t(contrasenaVisible ? 'auth.campos.ocultarContrasena' : 'auth.campos.mostrarContrasena');
    const idCampo = id ?? idGenerado;
    const idAyuda = `${idCampo}-ayuda`;
    const idError = `${idCampo}-error`;
    const descripcion = [descripcionExterna, ayuda && idAyuda, error && idError].filter(Boolean).join(' ') || undefined;
    const estadoInvalido = error ? true : invalido;
    const mostrarInvalido = estadoInvalido !== undefined && estadoInvalido !== false && estadoInvalido !== 'false';

    return (
        <div>
            <label htmlFor={idCampo} className="register-label block text-sm font-medium leading-5">{etiqueta}</label>
            <div className="relative">
                <input
                    {...props}
                    type={puedeAlternar && contrasenaVisible ? 'text' : type}
                    disabled={disabled}
                    id={idCampo}
                    aria-invalid={estadoInvalido}
                    aria-describedby={descripcion}
                    className={`register-input mt-1 h-11 w-full rounded-md border px-2.5 text-base leading-6 outline-none${puedeAlternar ? ' register-input-password' : ''}${mostrarInvalido ? ' register-input-invalid' : ''} ${className}`.trim()}
                />
                {puedeAlternar && (
                    <button
                        type="button"
                        className="register-password-toggle"
                        aria-label={etiquetaVisibilidad}
                        title={etiquetaVisibilidad}
                        aria-controls={idCampo}
                        disabled={disabled}
                        onClick={() => setContrasenaVisible((visible) => !visible)}
                    >
                        {contrasenaVisible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                    </button>
                )}
            </div>
            {ayuda && <p id={idAyuda} className="register-subtitle mt-1 text-sm">{ayuda}</p>}
            {error && <p id={idError} role="alert" className="mt-1 text-sm text-eventu-error">{error}</p>}
        </div>
    );
}
