import { useId, type InputHTMLAttributes } from 'react';
import { InputContrasena } from '../../../components/ui/InputContrasena';

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
    const puedeAlternar = permitirMostrarContrasena && type === 'password';
    const idCampo = id ?? idGenerado;
    const idAyuda = `${idCampo}-ayuda`;
    const idError = `${idCampo}-error`;
    const descripcion = [descripcionExterna, ayuda && idAyuda, error && idError].filter(Boolean).join(' ') || undefined;
    const estadoInvalido = error ? true : invalido;
    const mostrarInvalido = estadoInvalido !== undefined && estadoInvalido !== false && estadoInvalido !== 'false';
    const atributosCampo = {
        ...props,
        id: idCampo,
        disabled,
        'aria-invalid': estadoInvalido,
        'aria-describedby': descripcion,
        className: `register-input ${puedeAlternar ? '' : 'mt-1 '}h-11 w-full rounded-md border px-2.5 text-base leading-6 outline-none${mostrarInvalido ? ' register-input-invalid' : ''} ${className}`.trim(),
    };

    return (
        <div>
            <label htmlFor={idCampo} className="register-label block text-sm font-medium leading-5">{etiqueta}</label>
            <div className={puedeAlternar ? 'mt-1' : undefined}>
                {puedeAlternar ? <InputContrasena {...atributosCampo} /> : <input {...atributosCampo} type={type} />}
            </div>
            {ayuda && <p id={idAyuda} className="register-subtitle mt-1 text-sm">{ayuda}</p>}
            {error && <p id={idError} role="alert" className="mt-1 text-sm text-eventu-error">{error}</p>}
        </div>
    );
}
