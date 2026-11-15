import { useEffect, useState } from 'react';
import { milisegundosHastaMedianocheBogota } from '../../features/eventos/estadoTemporalEvento';

export function useAhoraBogota() {
    const [ahora, setAhora] = useState(() => new Date());

    useEffect(() => {
        let temporizador: ReturnType<typeof setTimeout>;
        const actualizarAlCambiarElDia = () => {
            const nuevoAhora = new Date();
            setAhora(nuevoAhora);
            temporizador = setTimeout(
                actualizarAlCambiarElDia,
                Math.max(1, milisegundosHastaMedianocheBogota(nuevoAhora) + 1),
            );
        };

        temporizador = setTimeout(
            actualizarAlCambiarElDia,
            Math.max(1, milisegundosHastaMedianocheBogota(new Date()) + 1),
        );

        return () => clearTimeout(temporizador);
    }, []);

    return ahora;
}
