// Respuesta de GET /estadisticas (EstadisticasResponseDTO)
export interface CategoriaConcurrida {
    categoria: string;
    inscripcionesActivas: number;
}

export interface EventoConMasInscritos {
    eventoId: number;
    titulo: string;
    inscripcionesActivas: number;
}

// Para un organizador las dos listas llegan vacías: los rankings solo los ve el administrador
export interface Estadisticas {
    inscripcionesActivas: number;
    asistentes: number;
    porcentajeAsistencia: number;
    categoriasMasConcurridas: CategoriaConcurrida[];
    eventosConMasInscritos: EventoConMasInscritos[];
}
