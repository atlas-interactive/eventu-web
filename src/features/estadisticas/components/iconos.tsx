import type { SVGProps } from 'react';

// Iconos de trazo del dashboard, decorativos y ocultos para lectores de pantalla.
function Icono({ children, ...props }: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            {...props}
        >
            {children}
        </svg>
    );
}

export const IconoBoleta = (props: SVGProps<SVGSVGElement>) => (
    <Icono {...props}>
        <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z" />
        <path d="M15 5v2M15 11v2M15 17v2" />
    </Icono>
);

export const IconoAsistente = (props: SVGProps<SVGSVGElement>) => (
    <Icono {...props}>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" />
        <path d="m16 11 2 2 4-4" />
    </Icono>
);

export const IconoGrafico = (props: SVGProps<SVGSVGElement>) => (
    <Icono {...props}>
        <path d="M12 3a9 9 0 1 0 9 9h-9z" />
        <path d="M15 3.5A9 9 0 0 1 20.5 9H15z" />
    </Icono>
);

export const IconoCategoria = (props: SVGProps<SVGSVGElement>) => (
    <Icono {...props}>
        <path d="M3 12.5V4a1 1 0 0 1 1-1h8.5L21 11.5 12.5 20z" />
        <circle cx="7.5" cy="7.5" r="1.5" />
    </Icono>
);

export const IconoCalendario = (props: SVGProps<SVGSVGElement>) => (
    <Icono {...props}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
        <path d="m9 15 2 2 4-4" />
    </Icono>
);
