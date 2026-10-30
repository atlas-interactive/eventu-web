import type { LucideIcon } from 'lucide-react';

interface TarjetaKpiProps {
    titulo: string;
    valor: string;
    detalle: string;
    Icono: LucideIcon;
    tono: 'rojo' | 'verde';
}

const TONOS = {
    rojo: { fondo: 'bg-eventu-soft-red-background', texto: 'text-eventu-institutional-red', borde: 'border-t-eventu-institutional-red' },
    verde: { fondo: 'bg-eventu-green-background', texto: 'text-eventu-success', borde: 'border-t-eventu-success' },
};

export function TarjetaKpi({ titulo, valor, detalle, Icono, tono }: TarjetaKpiProps) {
    const colores = TONOS[tono];
    return (
        <div
            className={`flex items-center gap-4 rounded-xl border border-t-4 border-eventu-border ${colores.borde} bg-eventu-white-surface p-5 sm:p-6`}
        >
            <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${colores.fondo} ${colores.texto}`}>
                <Icono className="h-7 w-7" aria-hidden="true" />
            </span>
            <div className="min-w-0">
                <dt className="text-sm font-medium text-eventu-secondary-text">{titulo}</dt>
                <dd className="text-[2.25rem] font-bold leading-tight text-eventu-main-ink">{valor}</dd>
                <dd className="text-sm text-eventu-secondary-text">{detalle}</dd>
            </div>
        </div>
    );
}
