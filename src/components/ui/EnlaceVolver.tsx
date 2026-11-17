import { ArrowLeft } from 'lucide-react';
import { Link, type LinkProps } from 'react-router-dom';
import '../../styles/back-link.css';

export function EnlaceVolver({ children, className = '', ...props }: LinkProps) {
    return (
        <Link {...props} className={`enlace-volver ${className}`.trim()}>
            <ArrowLeft aria-hidden="true" className="h-4 w-4 shrink-0" />
            {children}
        </Link>
    );
}
