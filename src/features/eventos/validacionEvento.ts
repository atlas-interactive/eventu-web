import i18n from '../../i18n';

// Valores del formulario tal como los escribe el usuario
export interface CamposEvento {
    titulo: string;
    descripcion: string;
    fechaInicio: string; // valor de <input type="datetime-local">, por ejemplo "2026-10-20T14:30"
    ubicacion: string;
    cuposMaximos: string;
    categoriaId: string;
    certificable: boolean;
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
    if (!titulo) errores.titulo = i18n.t('validacion.tituloObligatorio');
    else if (titulo.length > MAX_TITULO) {
        errores.titulo = i18n.t('validacion.tituloMaximo', { max: MAX_TITULO });
    }

    if (!campos.descripcion.trim()) errores.descripcion = i18n.t('validacion.descripcionObligatoria');

    if (!campos.fechaInicio) {
        errores.fechaInicio = i18n.t('validacion.fechaObligatoria');
    } else if (campos.fechaInicio !== opciones.fechaOriginal && new Date(campos.fechaInicio) <= ahora) {
        errores.fechaInicio = i18n.t('validacion.fechaFutura');
    }

    const ubicacion = campos.ubicacion.trim();
    if (!ubicacion) errores.ubicacion = i18n.t('validacion.ubicacionObligatoria');
    else if (ubicacion.length > MAX_UBICACION) {
        errores.ubicacion = i18n.t('validacion.ubicacionMaxima', { max: MAX_UBICACION });
    }

    const cupos = Number(campos.cuposMaximos);
    if (campos.cuposMaximos.trim() === '') {
        errores.cuposMaximos = i18n.t('validacion.cupoObligatorio');
    } else if (!Number.isInteger(cupos) || cupos < 1) {
        errores.cuposMaximos = i18n.t('validacion.cupoMayorCero');
    } else if (opciones.inscritos !== undefined && cupos < opciones.inscritos) {
        errores.cuposMaximos = i18n.t('validacion.cupoMinimoInscritos', {
            inscritos: opciones.inscritos,
        });
    }

    if (!campos.categoriaId) errores.categoriaId = i18n.t('validacion.categoriaObligatoria');

    return errores;
}
