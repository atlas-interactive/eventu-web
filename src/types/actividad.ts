export interface RegistroActividadItem {
    id: number;
    fecha: string;
    usuarioNombre: string | null;
    usuarioCorreo: string | null;
    accion: string;
    entidad: string;
    entidadId: number | null;
    resultado: string;
    motivo: string | null;
}

export interface OpcionesFiltroActividad {
    acciones: string[];
    entidades: string[];
    resultados: string[];
}

export interface FiltrosActividad {
    accion: string;
    entidad: string;
    resultado: string;
    usuario: string;
    fechaDesde: string;
    fechaHasta: string;
}

export interface PaginaActividad {
    contenido: RegistroActividadItem[];
    pagina: number;
    tamano: number;
    totalElementos: number;
    totalPaginas: number;
}
