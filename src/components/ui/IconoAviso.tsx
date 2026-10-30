import { CircleAlert, CircleCheck } from 'lucide-react';

interface IconoAvisoProps {
    tipo: 'error' | 'exito';
    className?: string;
}

export function IconoAviso({ tipo, className = '' }: IconoAvisoProps) {
    const Icono = tipo === 'error' ? CircleAlert : CircleCheck;
    return <Icono className={`shrink-0 ${className}`} aria-hidden="true" />;
}
