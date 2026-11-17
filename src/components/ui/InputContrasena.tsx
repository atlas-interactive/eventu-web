import { useId, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../../styles/password-input.css';

type InputContrasenaProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'>;

export function InputContrasena({ id, className = '', disabled, ...props }: InputContrasenaProps) {
    const idGenerado = useId();
    const idCampo = id ?? idGenerado;
    const [visible, setVisible] = useState(false);
    const { t } = useTranslation();
    const etiqueta = t(visible ? 'auth.campos.ocultarContrasena' : 'auth.campos.mostrarContrasena');

    return (
        <div className="password-input">
            <input
                {...props}
                id={idCampo}
                type={visible ? 'text' : 'password'}
                disabled={disabled}
                className={`password-input-control ${className}`.trim()}
            />
            <button
                type="button"
                className="password-input-toggle"
                aria-label={etiqueta}
                title={etiqueta}
                aria-controls={idCampo}
                disabled={disabled}
                onClick={() => setVisible((actual) => !actual)}
            >
                {visible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
            </button>
        </div>
    );
}
