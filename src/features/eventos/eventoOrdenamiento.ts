import type { Evento } from '../../types/evento';

export type OrdenEventos = 'fecha-proxima' | 'fecha-lejana' | 'titulo';

export const ordenarEventos = (eventos: Evento[], orden: OrdenEventos): Evento[] =>
    [...eventos].sort((a, b) => {
        if (orden === 'titulo') return a.titulo.localeCompare(b.titulo, 'es-CO');
        const diferencia = new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime();
        return orden === 'fecha-proxima' ? diferencia : -diferencia;
    });
