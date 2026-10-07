import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface ModalAccesibleProps {
    titulo: string;
    idTitulo: string;
    onCerrar: () => void;
    children: ReactNode;
}

// Diálogo modal accesible: role="dialog", foco dentro al abrir, Escape cierra, el foco vuelve al botón que lo abrió
export function ModalAccesible({ titulo, idTitulo, onCerrar, children }: ModalAccesibleProps) {
    const contenedor = useRef<HTMLDivElement>(null);
    // Se guarda el último cierre para que el efecto no se vuelva a ejecutar en cada render
    const cerrarRef = useRef(onCerrar);
    useEffect(() => {
        cerrarRef.current = onCerrar;
    });

    useEffect(() => {
        const elementoPrevio = document.activeElement as HTMLElement | null;
        const enfocables = () =>
            contenedor.current?.querySelectorAll<HTMLElement>(
                'input, button:not([disabled]), [href], select, textarea, [tabindex]:not([tabindex="-1"])',
            ) ?? [];

        enfocables()[0]?.focus();

        const alPresionar = (evento: KeyboardEvent) => {
            if (evento.key === 'Escape') {
                cerrarRef.current();
                return;
            }
            // Mantiene el foco atrapado dentro del diálogo
            if (evento.key === 'Tab') {
                const lista = Array.from(enfocables());
                if (lista.length === 0) return;
                const primero = lista[0];
                const ultimo = lista[lista.length - 1];
                if (evento.shiftKey && document.activeElement === primero) {
                    evento.preventDefault();
                    ultimo.focus();
                } else if (!evento.shiftKey && document.activeElement === ultimo) {
                    evento.preventDefault();
                    primero.focus();
                }
            }
        };

        document.addEventListener('keydown', alPresionar);
        return () => {
            document.removeEventListener('keydown', alPresionar);
            elementoPrevio?.focus();
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-eventu-main-ink/50 p-4">
            <div
                ref={contenedor}
                role="dialog"
                aria-modal="true"
                aria-labelledby={idTitulo}
                className="w-full max-w-[26rem] rounded-xl border border-eventu-border bg-eventu-white-surface p-6 text-eventu-main-ink shadow-lg"
            >
                <h2 id={idTitulo} className="mb-4 text-lg font-semibold">
                    {titulo}
                </h2>
                {children}
            </div>
        </div>
    );
}