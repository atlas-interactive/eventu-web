import { useCallback, useLayoutEffect, useState } from 'react';
import type { ReactNode } from 'react';
import i18n from '../../i18n';
import { ContextoAccesibilidad } from './AccesibilidadContext';
import {
    aplicarPreferenciasAccesibilidad,
    CLAVE_PREFERENCIAS_ACCESIBILIDAD,
    leerPreferenciasAccesibilidad,
    PREFERENCIAS_ACCESIBILIDAD_INICIALES,
} from './preferenciasAccesibilidad';
import type { PreferenciasAccesibilidad } from './preferenciasAccesibilidad';

export function AccesibilidadProvider({ children }: { children: ReactNode }) {
    const [cargaInicial] = useState(leerPreferenciasAccesibilidad);
    const [preferencias, setPreferencias] = useState(cargaInicial.preferencias);
    const [errorAlGuardar, setErrorAlGuardar] = useState('');
    const [advertenciaInicial, setAdvertenciaInicial] = useState(cargaInicial.advertencia);

    useLayoutEffect(() => {
        aplicarPreferenciasAccesibilidad(preferencias);
    }, [preferencias]);

    const guardar = useCallback((siguientes: PreferenciasAccesibilidad) => {
        setPreferencias(siguientes);
        setErrorAlGuardar('');
        try {
            window.localStorage.setItem(
                CLAVE_PREFERENCIAS_ACCESIBILIDAD,
                JSON.stringify(siguientes),
            );
            setAdvertenciaInicial('');
        } catch (error) {
            if (!(error instanceof DOMException)) throw error;
            console.error('No se pudieron guardar las preferencias de accesibilidad.', error);
            setErrorAlGuardar(i18n.t('accesibilidad.errorGuardar'));
        }
    }, []);

    const actualizarPreferencia = useCallback(
        <K extends keyof PreferenciasAccesibilidad>(
            clave: K,
            valor: PreferenciasAccesibilidad[K],
        ) => {
            guardar({ ...preferencias, [clave]: valor });
        },
        [guardar, preferencias],
    );

    const restablecerPreferencias = useCallback(
        () => guardar(PREFERENCIAS_ACCESIBILIDAD_INICIALES),
        [guardar],
    );

    return (
        <ContextoAccesibilidad.Provider
            value={{
                preferencias,
                actualizarPreferencia,
                restablecerPreferencias,
                errorAlGuardar,
                advertenciaInicial,
            }}
        >
            {children}
        </ContextoAccesibilidad.Provider>
    );
}
