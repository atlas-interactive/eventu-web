import { createContext } from 'react';
import type { PreferenciasAccesibilidad } from './preferenciasAccesibilidad';

export interface ContextoAccesibilidad {
    preferencias: PreferenciasAccesibilidad;
    actualizarPreferencia: <K extends keyof PreferenciasAccesibilidad>(
        clave: K,
        valor: PreferenciasAccesibilidad[K],
    ) => void;
    restablecerPreferencias: () => void;
    errorAlGuardar: string;
    advertenciaInicial: string;
}

export const ContextoAccesibilidad = createContext<ContextoAccesibilidad | null>(null);
