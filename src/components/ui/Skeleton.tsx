import type { ReactNode } from 'react';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return <span aria-hidden="true" className={`block animate-pulse rounded bg-eventu-border/70 ${className}`} />;
}

interface SkeletonEstadoProps {
    children: ReactNode;
    etiqueta: string;
    className?: string;
}

export function SkeletonEstado({ children, etiqueta, className = '' }: SkeletonEstadoProps) {
    return (
        <div role="status" aria-label={etiqueta} aria-busy="true" className={className}>
            {children}
            <span className="sr-only">{etiqueta}</span>
        </div>
    );
}

export function SkeletonPagina() {
    return (
        <SkeletonEstado etiqueta="Cargando pantalla" className="mx-auto w-full max-w-[70rem] px-4 py-8 sm:px-8">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="mt-2 h-4 w-72 max-w-full" />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl md:col-span-2" />
            </div>
        </SkeletonEstado>
    );
}

export function SkeletonAutenticacion() {
    return (
        <SkeletonEstado
            etiqueta="Cargando formulario"
            className="w-full max-w-md rounded-xl border border-eventu-border bg-eventu-white-surface p-6 shadow-sm"
        >
            <Skeleton className="mx-auto h-7 w-40" />
            <Skeleton className="mx-auto mt-2 h-4 w-56 max-w-full" />
            <Skeleton className="mt-8 h-4 w-24" />
            <Skeleton className="mt-2 h-11 w-full rounded-md" />
            <Skeleton className="mt-5 h-4 w-24" />
            <Skeleton className="mt-2 h-11 w-full rounded-md" />
            <Skeleton className="mt-6 h-11 w-full rounded-md" />
        </SkeletonEstado>
    );
}
