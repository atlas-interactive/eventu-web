import { LockKeyhole } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Skeleton, SkeletonEstado } from '../../../components/ui/Skeleton';

const columnas = [
    'actividad.fechaHora',
    'actividad.usuario',
    'actividad.accion',
    'actividad.entidad',
    'actividad.resultado',
    'actividad.motivo',
] as const;

export function TablaActividadSkeleton() {
    const { t } = useTranslation();
    return (
        <SkeletonEstado
            etiqueta={t('actividad.cargando')}
            className="actividad-tabla-contenedor"
        >
            <table className="actividad-tabla">
                <caption className="sr-only">{t('actividad.tablaAria')}</caption>
                <thead>
                    <tr>
                        {columnas.map((columna) => (
                            <th scope="col" key={columna}>{t(columna)}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 6 }, (_, indice) => (
                        <tr className="actividad-tabla-fila" key={indice}>
                            <td data-label={t('actividad.fechaHora')}>
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="mt-1 h-3 w-20" />
                            </td>
                            <td data-label={t('actividad.usuario')}>
                                <span className="actividad-usuario">
                                    <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
                                    <span className="grid flex-1 gap-1">
                                        <Skeleton className="h-4 w-24 max-w-full" />
                                        <Skeleton className="h-3 w-32 max-w-full" />
                                    </span>
                                </span>
                            </td>
                            <td data-label={t('actividad.accion')}>
                                <Skeleton className="h-4 w-24 max-w-full" />
                                <Skeleton className="mt-1 h-3 w-20" />
                            </td>
                            <td data-label={t('actividad.entidad')}><Skeleton className="h-5 w-20" /></td>
                            <td data-label={t('actividad.resultado')}><Skeleton className="h-6 w-16 rounded-full" /></td>
                            <td data-label={t('actividad.motivo')}><Skeleton className="h-4 w-28 max-w-full" /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p className="actividad-solo-lectura">
                <LockKeyhole aria-hidden="true" />
                {t('actividad.soloLectura')}
            </p>
        </SkeletonEstado>
    );
}
