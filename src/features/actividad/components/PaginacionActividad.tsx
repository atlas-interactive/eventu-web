import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginacionActividadProps {
    totalRegistros: number;
}

export function PaginacionActividad({ totalRegistros }: PaginacionActividadProps) {
    return (
        <nav className="actividad-paginacion" aria-label="Paginación de actividad">
            <span>
                {totalRegistros === 0
                    ? 'Mostrando 0 registros'
                    : `Mostrando 1–${Math.min(20, totalRegistros)} de ${totalRegistros} registros`}
                <span className="actividad-tamano-pagina"> · 20 por página</span>
            </span>
            <div className="actividad-paginacion-botones">
                <button type="button" aria-label="Página anterior" disabled>
                    <ChevronLeft aria-hidden="true" />
                </button>
                <span aria-current="page">1</span>
                <button type="button" aria-label="Página siguiente" disabled>
                    <ChevronRight aria-hidden="true" />
                </button>
            </div>
        </nav>
    );
}
