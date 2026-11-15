import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { FiltrosActividad } from '../../../types/actividad';

interface FiltrosActivosActividadProps {
    filtros: FiltrosActividad;
    onQuitar: (campo: keyof FiltrosActividad) => void;
}

const fechaCorta = (fecha: string) =>
    new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' }).format(
        new Date(`${fecha}T00:00:00`),
    );

export function FiltrosActivosActividad({ filtros, onQuitar }: FiltrosActivosActividadProps) {
    const { t } = useTranslation();
    const activos: { campo: keyof FiltrosActividad; etiqueta: string }[] = [];
    if (filtros.usuario) {
        activos.push({
            campo: 'usuario',
            etiqueta: t('actividad.usuarioPrefijo', { usuario: filtros.usuario }),
        });
    }
    if (filtros.accion) activos.push({ campo: 'accion', etiqueta: filtros.accion.replaceAll('_', ' ') });
    if (filtros.entidad) activos.push({ campo: 'entidad', etiqueta: filtros.entidad });
    if (filtros.resultado) activos.push({ campo: 'resultado', etiqueta: filtros.resultado });
    if (filtros.fechaDesde || filtros.fechaHasta) {
        activos.push({
            campo: 'fechaDesde',
            etiqueta: `${filtros.fechaDesde ? fechaCorta(filtros.fechaDesde) : t('actividad.desde')} – ${filtros.fechaHasta ? fechaCorta(filtros.fechaHasta) : t('actividad.hoy')}`,
        });
    }

    if (activos.length === 0) return null;

    return (
        <div className="actividad-filtros-activos" aria-label={t('actividad.filtrosActivosAria')}>
            <span>{t('actividad.con')}</span>
            {activos.map(({ campo, etiqueta }) => (
                <button
                    className="actividad-filtro-activo"
                    type="button"
                    key={campo}
                    aria-label={t('actividad.quitarFiltro', { etiqueta })}
                    onClick={() => onQuitar(campo)}
                >
                    {etiqueta}
                    <X aria-hidden="true" />
                </button>
            ))}
        </div>
    );
}
