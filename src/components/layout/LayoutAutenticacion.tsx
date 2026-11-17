import { useState } from 'react';
import { Moon, PersonStanding, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { PanelAccesibilidad } from '../../features/accesibilidad/PanelAccesibilidad';
import { useAccesibilidad } from '../../features/accesibilidad/useAccesibilidad';

const estiloControl = 'group relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-eventu-secondary-text hover:bg-eventu-white-surface hover:text-eventu-main-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventu-institutional-red';
const estiloAyuda = 'pointer-events-none absolute right-0 top-full z-10 mt-1 w-max max-w-48 rounded border border-eventu-border bg-eventu-white-surface px-2 py-1 text-xs text-eventu-main-ink opacity-0 shadow-sm group-hover:opacity-100 group-focus-visible:opacity-100';

// Pantallas de autenticación: tarjeta centrada
export function LayoutAutenticacion() {
    const { t } = useTranslation();
    const { preferencias, actualizarPreferencia } = useAccesibilidad();
    const [accesibilidadAbierta, setAccesibilidadAbierta] = useState(false);
    const [elementoFoco, setElementoFoco] = useState<HTMLElement | null>(null);
    const temaOscuro = preferencias.tema === 'oscuro';
    const etiquetaTema = t(temaOscuro ? 'layout.activarTemaClaro' : 'layout.activarTemaOscuro');

    return (
        <div className="flex min-h-screen flex-col bg-eventu-page-background p-4 sm:p-6">
            <div role="group" aria-label={t('layout.preferenciasVisuales')} className="flex shrink-0 justify-end gap-1 sm:gap-2">
                <button
                    type="button"
                    className={estiloControl}
                    aria-label={t('layout.accesibilidad')}
                    aria-haspopup="dialog"
                    aria-expanded={accesibilidadAbierta}
                    onClick={(evento) => {
                        setElementoFoco(evento.currentTarget);
                        setAccesibilidadAbierta(true);
                    }}
                >
                    <PersonStanding aria-hidden="true" className="h-[1.375rem] w-[1.375rem]" />
                    <span aria-hidden="true" className={estiloAyuda}>{t('layout.accesibilidad')}</span>
                </button>
                <button
                    type="button"
                    className={estiloControl}
                    aria-label={etiquetaTema}
                    onClick={() => actualizarPreferencia('tema', temaOscuro ? 'claro' : 'oscuro')}
                >
                    {temaOscuro
                        ? <Sun aria-hidden="true" className="h-[1.375rem] w-[1.375rem]" />
                        : <Moon aria-hidden="true" className="h-[1.375rem] w-[1.375rem]" />}
                    <span aria-hidden="true" className={estiloAyuda}>{etiquetaTema}</span>
                </button>
            </div>
            <main className="flex flex-1 items-center justify-center py-4">
                <div className="w-full min-w-0 max-w-[34rem]">
                    <Outlet />
                </div>
            </main>
            {accesibilidadAbierta && (
                <PanelAccesibilidad
                    onCerrar={() => setAccesibilidadAbierta(false)}
                    elementoFocoRestaurar={elementoFoco}
                />
            )}
        </div>
    );
}
