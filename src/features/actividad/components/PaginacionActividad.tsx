import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PaginacionActividadProps {
    totalRegistros: number;
    pagina: number;
    totalPaginas: number;
    onCambiarPagina: (pagina: number) => void;
}

export function PaginacionActividad({
    totalRegistros,
    pagina,
    totalPaginas,
    onCambiarPagina,
}: PaginacionActividadProps) {
    const { t } = useTranslation();
    const primerRegistro = totalRegistros === 0 ? 0 : pagina * 20 + 1;
    const ultimoRegistro = Math.min((pagina + 1) * 20, totalRegistros);
    const cantidadPaginasVisibles = Math.min(5, totalPaginas);
    const primeraPaginaVisible = Math.max(0, Math.min(pagina - 2, totalPaginas - cantidadPaginasVisibles));
    const paginas = Array.from({ length: cantidadPaginasVisibles }, (_, indice) => primeraPaginaVisible + indice);

    return (
        <nav className="actividad-paginacion" aria-label={t('actividad.paginacionAria')}>
            <span>
                {t('actividad.mostrando', {
                    desde: primerRegistro,
                    hasta: ultimoRegistro,
                    total: totalRegistros,
                })}
                <span className="actividad-tamano-pagina">{t('actividad.porPagina')}</span>
            </span>
            <div className="actividad-paginacion-botones">
                <button
                    type="button"
                    aria-label={t('actividad.paginaAnterior')}
                    disabled={pagina === 0}
                    onClick={() => onCambiarPagina(pagina - 1)}
                >
                    <ChevronLeft aria-hidden="true" />
                </button>
                {paginas.map((numeroPagina) => (
                    <button
                        type="button"
                        key={numeroPagina}
                        aria-label={t('actividad.pagina', { numero: numeroPagina + 1 })}
                        aria-current={pagina === numeroPagina ? 'page' : undefined}
                        onClick={() => onCambiarPagina(numeroPagina)}
                    >
                        {numeroPagina + 1}
                    </button>
                ))}
                <button
                    type="button"
                    aria-label={t('actividad.paginaSiguiente')}
                    disabled={pagina + 1 >= totalPaginas}
                    onClick={() => onCambiarPagina(pagina + 1)}
                >
                    <ChevronRight aria-hidden="true" />
                </button>
            </div>
        </nav>
    );
}
