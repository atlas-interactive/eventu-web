import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './es.json';
import en from './en.json';

export const CLAVE_IDIOMA = 'eventu:idioma';
export const IDIOMAS = ['es', 'en'] as const;
export type Idioma = (typeof IDIOMAS)[number];

const esIdioma = (valor: string | null): valor is Idioma =>
    valor !== null && IDIOMAS.some((idioma) => idioma === valor);

const leerIdiomaGuardado = (): Idioma => {
    try {
        const guardado = window.localStorage.getItem(CLAVE_IDIOMA);
        return esIdioma(guardado) ? guardado : 'es';
    } catch {
        // Si el navegador bloquea el almacenamiento se usa el idioma por defecto
        return 'es';
    }
};

export const aplicarIdiomaDocumento = (idioma: string): void => {
    if (typeof document !== 'undefined') {
        document.documentElement.lang = idioma;
    }
};

const idiomaInicial = leerIdiomaGuardado();

i18n.use(initReactI18next).init({
    resources: {
        es: { translation: es },
        en: { translation: en },
    },
    lng: idiomaInicial,
    fallbackLng: 'es',
    supportedLngs: [...IDIOMAS],
    initAsync: false,
    interpolation: {
        escapeValue: false,
    },
});

aplicarIdiomaDocumento(idiomaInicial);

i18n.on('languageChanged', (idioma) => {
    aplicarIdiomaDocumento(idioma);
    try {
        window.localStorage.setItem(CLAVE_IDIOMA, idioma);
    } catch {
        // La preferencia se aplica en la sesión actual aunque no se pueda guardar
    }
});

export const cambiarIdioma = (idioma: Idioma): void => {
    void i18n.changeLanguage(idioma);
};

export default i18n;
