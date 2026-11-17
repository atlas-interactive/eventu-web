import { useId, type InputHTMLAttributes } from 'react';

interface CampoAutenticacionProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'children'> {
    etiqueta: string;
    ayuda?: string;
    error?: string;
}

// Conserva los atributos nativos; únicamente comparte presentación y asociaciones accesibles.
export function CampoAutenticacion({
    etiqueta,
    ayuda,
    error,
    id,
    className = '',
    'aria-describedby': descripcionExterna,
    'aria-invalid': invalido,
    ...props
}: CampoAutenticacionProps) {
    const idGenerado = useId();
    const idCampo = id ?? idGenerado;
    const idAyuda = `${idCampo}-ayuda`;
    const idError = `${idCampo}-error`;
    const descripcion = [descripcionExterna, ayuda && idAyuda, error && idError].filter(Boolean).join(' ') || undefined;
    const estadoInvalido = error ? true : invalido;
    const mostrarInvalido = estadoInvalido !== undefined && estadoInvalido !== false && estadoInvalido !== 'false';

    return (
        <div>
            <label htmlFor={idCampo} className="register-label block text-sm font-medium leading-5">{etiqueta}</label>
            <input
                {...props}
                id={idCampo}
                aria-invalid={estadoInvalido}
                aria-describedby={descripcion}
                className={`register-input mt-1 h-11 w-full rounded-md border px-2.5 text-base leading-6 outline-none${mostrarInvalido ? ' register-input-invalid' : ''} ${className}`.trim()}
            />
            {ayuda && <p id={idAyuda} className="register-subtitle mt-1 text-sm">{ayuda}</p>}
            {error && <p id={idError} role="alert" className="mt-1 text-sm text-eventu-error">{error}</p>}
        </div>
    );
}
