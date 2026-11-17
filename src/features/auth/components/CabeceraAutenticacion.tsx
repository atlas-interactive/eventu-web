import type { ReactNode } from 'react';
import iconoEventU from '../../../assets/icons/iconoEventU.png';

interface CabeceraAutenticacionProps {
    titulo: string;
    subtitulo?: ReactNode;
    icono?: ReactNode;
    claseSubtitulo?: string;
}

export function CabeceraAutenticacion({
    titulo,
    subtitulo,
    icono,
    claseSubtitulo = 'leading-5',
}: CabeceraAutenticacionProps) {
    return (
        <header className="mb-3 text-center">
            <img src={iconoEventU} alt="" aria-hidden="true" className="mx-auto mb-2 h-9 w-9" />
            <p className="text-2xl font-semibold leading-5">Event<span className="text-eventu-institutional-red">U</span></p>
            {icono}
            <h1 className="mt-2 text-base font-semibold leading-7">{titulo}</h1>
            {subtitulo && <p className={`register-subtitle mt-0.5 text-sm ${claseSubtitulo}`}>{subtitulo}</p>}
        </header>
    );
}
