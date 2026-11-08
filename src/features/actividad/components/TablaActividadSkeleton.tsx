import { LockKeyhole } from 'lucide-react';
import { Skeleton, SkeletonEstado } from '../../../components/ui/Skeleton';

const columnas = ['Fecha y hora', 'Usuario', 'Acción', 'Entidad', 'Resultado', 'Motivo'];

export function TablaActividadSkeleton() {
    return (
        <SkeletonEstado
            etiqueta="Cargando registros de actividad"
            className="actividad-tabla-contenedor"
        >
            <table className="actividad-tabla" aria-label="Registros de actividad">
                <thead>
                    <tr>
                        {columnas.map((columna) => (
                            <th scope="col" key={columna}>{columna}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 6 }, (_, indice) => (
                        <tr className="actividad-tabla-fila" key={indice}>
                            <td data-label="Fecha y hora">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="mt-1 h-3 w-20" />
                            </td>
                            <td data-label="Usuario">
                                <span className="actividad-usuario">
                                    <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
                                    <span className="grid flex-1 gap-1">
                                        <Skeleton className="h-4 w-24 max-w-full" />
                                        <Skeleton className="h-3 w-32 max-w-full" />
                                    </span>
                                </span>
                            </td>
                            <td data-label="Acción">
                                <Skeleton className="h-4 w-24 max-w-full" />
                                <Skeleton className="mt-1 h-3 w-20" />
                            </td>
                            <td data-label="Entidad"><Skeleton className="h-5 w-20" /></td>
                            <td data-label="Resultado"><Skeleton className="h-6 w-16 rounded-full" /></td>
                            <td data-label="Motivo"><Skeleton className="h-4 w-28 max-w-full" /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p className="actividad-solo-lectura">
                <LockKeyhole aria-hidden="true" />
                Solo lectura: los registros no se pueden editar ni eliminar.
            </p>
        </SkeletonEstado>
    );
}
