import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ModalAccesible } from '../../components/ui/ModalAccesible';
import { useAccesibilidad } from './useAccesibilidad';
import {
    ESCALAS_TEXTO,
    esModoContraste,
    esModoFuente,
} from './preferenciasAccesibilidad';

interface PanelAccesibilidadProps {
    onCerrar: () => void;
    elementoFocoRestaurar: HTMLElement | null;
}

const opcionesCampo =
    'block w-full appearance-none rounded-md border border-eventu-field-border bg-eventu-white-surface px-3 py-2 pr-10 text-eventu-main-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red';

export function PanelAccesibilidad({
    onCerrar,
    elementoFocoRestaurar,
}: PanelAccesibilidadProps) {
    const { t } = useTranslation();
    const {
        preferencias,
        actualizarPreferencia,
        errorAlGuardar,
        advertenciaInicial,
    } = useAccesibilidad();
    const indiceEscalaTexto = ESCALAS_TEXTO.indexOf(preferencias.escalaTexto);
    const cambiarEscalaTexto = (direccion: -1 | 1) => {
        const indiceSiguiente = Math.max(
            0,
            Math.min(ESCALAS_TEXTO.length - 1, indiceEscalaTexto + direccion),
        );
        const escalaSiguiente = ESCALAS_TEXTO[indiceSiguiente];
        if (escalaSiguiente !== undefined) {
            actualizarPreferencia('escalaTexto', escalaSiguiente);
        }
    };

    return (
        <ModalAccesible
            titulo={t('accesibilidad.titulo')}
            idTitulo="titulo-panel-accesibilidad"
            onCerrar={onCerrar}
            elementoFocoRestaurar={elementoFocoRestaurar}
        >
            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <span id="accesibilidad-escala-etiqueta" className="text-sm font-medium">
                        {t('accesibilidad.tamanoFuente')}
                    </span>
                    <div
                        role="group"
                        aria-labelledby="accesibilidad-escala-etiqueta"
                        className="accesibilidad-controles-fuente"
                    >
                        <button
                            type="button"
                            aria-label={t('accesibilidad.reducirFuente')}
                            title={t('accesibilidad.reducirFuente')}
                            disabled={indiceEscalaTexto === 0}
                            className="rounded font-medium text-eventu-main-ink hover:bg-eventu-page-background disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red"
                            onClick={() => cambiarEscalaTexto(-1)}
                        >
                            A-
                        </button>
                        <button
                            type="button"
                            aria-label={t('accesibilidad.fuentePredeterminada')}
                            aria-pressed={preferencias.escalaTexto === 1}
                            title={t('accesibilidad.fuentePredeterminadaTitulo')}
                            className="rounded font-medium text-eventu-main-ink hover:bg-eventu-page-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red"
                            onClick={() => actualizarPreferencia('escalaTexto', 1)}
                        >
                            A
                        </button>
                        <button
                            type="button"
                            aria-label={t('accesibilidad.aumentarFuente')}
                            title={t('accesibilidad.aumentarFuente')}
                            disabled={indiceEscalaTexto === ESCALAS_TEXTO.length - 1}
                            className="rounded font-medium text-eventu-main-ink hover:bg-eventu-page-background disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red"
                            onClick={() => cambiarEscalaTexto(1)}
                        >
                            A+
                        </button>
                    </div>
                </div>

                <div>
                    <label htmlFor="accesibilidad-contraste" className="block text-sm font-medium">
                        {t('accesibilidad.nivelContraste')}
                    </label>
                    <div className="relative mt-1">
                        <select
                            id="accesibilidad-contraste"
                            className={opcionesCampo}
                            value={preferencias.contraste}
                            onChange={(evento) => {
                                const contraste = evento.target.value;
                                if (esModoContraste(contraste)) actualizarPreferencia('contraste', contraste);
                            }}
                        >
                            <option value="normal">{t('accesibilidad.normal')}</option>
                            <option value="alto">{t('accesibilidad.altoContraste')}</option>
                        </select>
                        <ChevronDown
                            className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-eventu-main-ink"
                            aria-hidden="true"
                        />
                    </div>
                    <p className="mt-1 text-sm text-eventu-secondary-text">
                        {t('accesibilidad.notaTema')}
                    </p>
                </div>

                <div>
                    <label htmlFor="accesibilidad-fuente" className="block text-sm font-medium">
                        {t('accesibilidad.tipografia')}
                    </label>
                    <div className="relative mt-1">
                        <select
                            id="accesibilidad-fuente"
                            className={opcionesCampo}
                            value={preferencias.fuente}
                            onChange={(evento) => {
                                const fuente = evento.target.value;
                                if (esModoFuente(fuente)) actualizarPreferencia('fuente', fuente);
                            }}
                        >
                            <option value="sistema">{t('accesibilidad.fuenteSistema')}</option>
                            <option value="atkinson">{t('accesibilidad.fuenteAtkinson')}</option>
                        </select>
                        <ChevronDown
                            className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-eventu-main-ink"
                            aria-hidden="true"
                        />
                    </div>
                </div>

                {(errorAlGuardar || advertenciaInicial) && (
                    <p role="alert" className="text-sm text-eventu-error">
                        {errorAlGuardar || advertenciaInicial}
                    </p>
                )}

                <button
                    type="button"
                    className="w-full min-w-0 break-words rounded-md bg-eventu-institutional-red px-3 py-2 text-sm font-medium text-eventu-page-background hover:bg-eventu-institutional-red-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red"
                    onClick={onCerrar}
                >
                    {t('accesibilidad.aceptar')}
                </button>
            </div>
        </ModalAccesible>
    );
}
