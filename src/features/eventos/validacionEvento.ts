// Campos del formulario tal como los escribe el usuario (todo texto)
export interface CamposEvento {
    titulo: string;
    descripcion: string;
    fechaInicio: string; // valor de <input type="datetime-local">, por ejemplo "2026-10-20T14:30"
    ubicacion: string;
    cuposMaximos: string;
    categoriaId: string;
}

export type ErroresEvento = Partial<Record<keyof CamposEvento, string>>;

interface OpcionesValidacion {
    // Al editar: cuántas personas ya están inscritas, el cupo no puede quedar por debajo
    inscritos?: number;
    // Al editar: si la fecha no cambió no se exige que sea futura (el backend tampoco la recibe)
    fechaOriginal?: string;
    ahora?: Date;
}

export const MAX_TITULO = 150;
export const MAX_UBICACION = 150;

// Mismas reglas que EventoRequestDTO. La validación real está en el backend, esto solo da respuesta inmediata
export function validarEvento(campos: CamposEvento, opciones: OpcionesValidacion = {}): ErroresEvento {
    const errores: ErroresEvento = {};
    const ahora = opciones.ahora ?? new Date();

    const titulo = campos.titulo.trim();
    if (!titulo) errores.titulo = 'El título es obligatorio.';
    else if (titulo.length > MAX_TITULO) errores.titulo = `El título no puede superar los ${MAX_TITULO} caracteres.`;

    if (!campos.descripcion.trim()) errores.descripcion = 'La descripción es obligatoria.';

    if (!campos.fechaInicio) {
        errores.fechaInicio = 'La fecha y hora de inicio son obligatorias.';
    } else if (campos.fechaInicio !== opciones.fechaOriginal && new Date(campos.fechaInicio) <= ahora) {
        errores.fechaInicio = 'La fecha de inicio debe ser futura.';
    }

    const ubicacion = campos.ubicacion.trim();
    if (!ubicacion) errores.ubicacion = 'La ubicación es obligatoria.';
    else if (ubicacion.length > MAX_UBICACION) {
        errores.ubicacion = `La ubicación no puede superar los ${MAX_UBICACION} caracteres.`;
    }

    const cupos = Number(campos.cuposMaximos);
    if (campos.cuposMaximos.trim() === '') {
        errores.cuposMaximos = 'El cupo máximo es obligatorio.';
    } else if (!Number.isInteger(cupos) || cupos < 1) {
        errores.cuposMaximos = 'El cupo máximo debe ser mayor a cero.';
    } else if (opciones.inscritos !== undefined && cupos < opciones.inscritos) {
        errores.cuposMaximos = `No se puede reducir la capacidad por debajo de los inscritos actuales (${opciones.inscritos}).`;
    }

    if (!campos.categoriaId) errores.categoriaId = 'La categoría es obligatoria.';

    return errores;
}
