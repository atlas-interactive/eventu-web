// Respuesta del backend para una categoría (CategoriaResponseDTO)
export interface Categoria {
    id: number;
    nombre: string;
    activo: boolean;
    creadoEn: string;
    // Solo cuenta eventos en estado PUBLICADO
    eventosActivos: number;
}

// Cuerpo de POST /categorias y PUT /categorias/{id}. Activar y desactivar no llevan cuerpo: solo el id
export interface CategoriaSolicitud {
    nombre: string;
}