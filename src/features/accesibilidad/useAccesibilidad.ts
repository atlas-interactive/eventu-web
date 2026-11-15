import { useContext } from 'react';
import { ContextoAccesibilidad } from './AccesibilidadContext';

export function useAccesibilidad() {
    const contexto = useContext(ContextoAccesibilidad);
    if (!contexto) {
        throw new Error('useAccesibilidad debe usarse dentro de AccesibilidadProvider.');
    }
    return contexto;
}
