export const CLAVE_PREFERENCIAS_ACCESIBILIDAD = 'eventu:preferencias-accesibilidad';

export const ESCALAS_TEXTO = [0.75, 1, 1.25, 1.5, 2] as const;
export type EscalaTexto = (typeof ESCALAS_TEXTO)[number];
export type ModoContraste = 'normal' | 'alto' | 'invertido';
export type ModoFuente = 'atkinson' | 'sistema';

export interface PreferenciasAccesibilidad {
    escalaTexto: EscalaTexto;
    contraste: ModoContraste;
    fuente: ModoFuente;
}

export const PREFERENCIAS_ACCESIBILIDAD_INICIALES: PreferenciasAccesibilidad = {
    escalaTexto: 1,
    contraste: 'normal',
    fuente: 'atkinson',
};

interface ResultadoCargaPreferencias {
    preferencias: PreferenciasAccesibilidad;
    advertencia: string;
}

export const esEscalaTexto = (valor: unknown): valor is EscalaTexto =>
    typeof valor === 'number' && ESCALAS_TEXTO.some((escala) => escala === valor);

export const esModoContraste = (valor: unknown): valor is ModoContraste =>
    valor === 'normal' || valor === 'alto' || valor === 'invertido';

export const esModoFuente = (valor: unknown): valor is ModoFuente =>
    valor === 'atkinson' || valor === 'sistema';

const sonPreferenciasAccesibilidad = (valor: unknown): valor is PreferenciasAccesibilidad => {
    if (typeof valor !== 'object' || valor === null) return false;
    const preferencias = valor as Record<string, unknown>;
    return (
        esEscalaTexto(preferencias.escalaTexto) &&
        esModoContraste(preferencias.contraste) &&
        esModoFuente(preferencias.fuente)
    );
};

export const leerPreferenciasAccesibilidad = (): ResultadoCargaPreferencias => {
    let guardado: string | null;
    try {
        guardado = window.localStorage.getItem(CLAVE_PREFERENCIAS_ACCESIBILIDAD);
    } catch (error) {
        if (!(error instanceof DOMException)) throw error;
        console.error('No se pudieron leer las preferencias de accesibilidad.', error);
        return {
            preferencias: PREFERENCIAS_ACCESIBILIDAD_INICIALES,
            advertencia: 'No se pudieron cargar las preferencias guardadas en este navegador.',
        };
    }

    if (!guardado) {
        return { preferencias: PREFERENCIAS_ACCESIBILIDAD_INICIALES, advertencia: '' };
    }

    let valor: unknown;
    try {
        valor = JSON.parse(guardado);
    } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
        console.error('Las preferencias de accesibilidad guardadas no tienen un formato válido.', error);
        return {
            preferencias: PREFERENCIAS_ACCESIBILIDAD_INICIALES,
            advertencia: 'Las preferencias guardadas no eran válidas; se restablecieron los valores iniciales.',
        };
    }

    if (!sonPreferenciasAccesibilidad(valor)) {
        console.error('Las preferencias de accesibilidad guardadas contienen valores no admitidos.');
        return {
            preferencias: PREFERENCIAS_ACCESIBILIDAD_INICIALES,
            advertencia: 'Las preferencias guardadas no eran válidas; se restablecieron los valores iniciales.',
        };
    }

    return { preferencias: valor, advertencia: '' };
};

export const aplicarPreferenciasAccesibilidad = (preferencias: PreferenciasAccesibilidad): void => {
    const raiz = document.documentElement;
    raiz.dataset.accesibilidadContraste = preferencias.contraste;
    raiz.dataset.accesibilidadFuente = preferencias.fuente;
    raiz.dataset.accesibilidadEscala = String(preferencias.escalaTexto);
    raiz.style.setProperty('--accesibilidad-escala-texto', String(preferencias.escalaTexto));
};
