import i18n from '../../i18n';

export const CLAVE_PREFERENCIAS_ACCESIBILIDAD = 'eventu:preferencias-accesibilidad';

export const ESCALAS_TEXTO = [0.75, 1, 1.25, 1.5, 2] as const;
export type EscalaTexto = (typeof ESCALAS_TEXTO)[number];
export type ModoTema = 'claro' | 'oscuro';
export type ModoContraste = 'normal' | 'alto';
export type ModoFuente = 'atkinson' | 'sistema';

export interface PreferenciasAccesibilidad {
    escalaTexto: EscalaTexto;
    tema: ModoTema;
    contraste: ModoContraste;
    fuente: ModoFuente;
}

export const PREFERENCIAS_ACCESIBILIDAD_INICIALES: PreferenciasAccesibilidad = {
    escalaTexto: 1,
    tema: 'claro',
    contraste: 'normal',
    fuente: 'sistema',
};

interface ResultadoCargaPreferencias {
    preferencias: PreferenciasAccesibilidad;
    advertencia: string;
}

export const esEscalaTexto = (valor: unknown): valor is EscalaTexto =>
    typeof valor === 'number' && ESCALAS_TEXTO.some((escala) => escala === valor);

export const esModoTema = (valor: unknown): valor is ModoTema =>
    valor === 'claro' || valor === 'oscuro';

export const esModoContraste = (valor: unknown): valor is ModoContraste =>
    valor === 'normal' || valor === 'alto';

export const esModoFuente = (valor: unknown): valor is ModoFuente =>
    valor === 'atkinson' || valor === 'sistema';

const normalizarPreferenciasAccesibilidad = (valor: unknown): PreferenciasAccesibilidad | null => {
    if (typeof valor !== 'object' || valor === null) return null;
    const preferencias = valor as Record<string, unknown>;
    if (!esEscalaTexto(preferencias.escalaTexto) || !esModoFuente(preferencias.fuente)) return null;

    if (esModoTema(preferencias.tema) && esModoContraste(preferencias.contraste)) {
        return {
            escalaTexto: preferencias.escalaTexto,
            tema: preferencias.tema,
            contraste: preferencias.contraste,
            fuente: preferencias.fuente,
        };
    }

    if (preferencias.tema === undefined) {
        if (preferencias.contraste === 'invertido') {
            return {
                escalaTexto: preferencias.escalaTexto,
                tema: 'oscuro',
                contraste: 'normal',
                fuente: preferencias.fuente,
            };
        }
        if (preferencias.contraste === 'normal' || preferencias.contraste === 'alto') {
            return {
                escalaTexto: preferencias.escalaTexto,
                tema: 'claro',
                contraste: preferencias.contraste,
                fuente: preferencias.fuente,
            };
        }
    }

    return null;
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
            advertencia: i18n.t('accesibilidad.advertenciaCarga'),
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
            advertencia: i18n.t('accesibilidad.advertenciaInvalida'),
        };
    }

    const preferencias = normalizarPreferenciasAccesibilidad(valor);
    if (!preferencias) {
        console.error('Las preferencias de accesibilidad guardadas contienen valores no admitidos.');
        return {
            preferencias: PREFERENCIAS_ACCESIBILIDAD_INICIALES,
            advertencia: i18n.t('accesibilidad.advertenciaInvalida'),
        };
    }

    return { preferencias, advertencia: '' };
};

export const aplicarPreferenciasAccesibilidad = (preferencias: PreferenciasAccesibilidad): void => {
    const raiz = document.documentElement;
    raiz.dataset.accesibilidadTema = preferencias.tema;
    raiz.dataset.accesibilidadContraste = preferencias.contraste;
    raiz.dataset.accesibilidadFuente = preferencias.fuente;
    raiz.dataset.accesibilidadEscala = String(preferencias.escalaTexto);
    raiz.style.setProperty('--accesibilidad-escala-texto', String(preferencias.escalaTexto));
};
