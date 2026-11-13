import { describe, expect, it } from 'vitest';
import {
    formatearFechaHoraActividad,
    formatearTiempoRelativoActividad,
} from '../../../../src/features/actividad/services/formatoFechaActividad';

describe('formatoFechaActividad', () => {
    const ahora = new Date(2026, 10, 8, 12, 0);

    it.each([
        ['2026-11-08T11:55:00', 'Hace 5 min'],
        ['2026-11-08T10:00:00', 'Hace 2 h'],
        ['2026-11-07T18:00:00', 'Ayer'],
    ])('formatea %s como tiempo relativo', (fecha, esperado) => {
        expect(formatearTiempoRelativoActividad(fecha, ahora)).toBe(esperado);
    });

    it('muestra la fecha corta de un registro antiguo del mismo año', () => {
        expect(formatearTiempoRelativoActividad('2026-11-02T08:05:00', ahora)).toMatch(/2 nov/i);
    });

    it('mantiene la fecha y hora exactas para el detalle secundario', () => {
        expect(formatearFechaHoraActividad('2026-11-05T12:44:00')).toMatch(/5 nov.*12:44/i);
    });

    it('conserva el valor recibido si la fecha no es válida', () => {
        expect(formatearTiempoRelativoActividad('fecha inválida', ahora)).toBe('fecha inválida');
        expect(formatearFechaHoraActividad('fecha inválida')).toBe('fecha inválida');
    });
});
