import { describe, expect, it } from 'vitest';
import {
    eventoYaIniciado,
    obtenerEstadoTemporalEvento,
    terminoDiaEvento,
} from '../../../../src/features/eventos/estadoTemporalEvento';

describe('estadoTemporalEvento', () => {
    const ahoraBogota = new Date('2026-11-14T17:00:00.000Z');

    it('interpreta la fecha local del backend en la zona horaria de Bogotá', () => {
        expect(obtenerEstadoTemporalEvento('2026-11-14T11:59:59', ahoraBogota)).toBe('EN_CURSO');
        expect(obtenerEstadoTemporalEvento('2026-11-14T12:00:00', ahoraBogota)).toBe('EN_CURSO');
        expect(obtenerEstadoTemporalEvento('2026-11-14T12:00:01', ahoraBogota)).toBe('FUTURO');
        expect(obtenerEstadoTemporalEvento('2026-11-13T23:59:59', ahoraBogota)).toBe('FINALIZADO');
    });

    it('mantiene QR disponible durante el día del evento y lo vence al día siguiente', () => {
        const ultimoInstanteDelDia = new Date('2026-11-15T04:59:59.999Z');
        const medianocheBogota = new Date('2026-11-15T05:00:00.000Z');

        expect(terminoDiaEvento('2026-11-14T09:00:00', ultimoInstanteDelDia)).toBe(false);
        expect(terminoDiaEvento('2026-11-14T09:00:00', medianocheBogota)).toBe(true);
        expect(eventoYaIniciado('2026-11-14T09:00:00', medianocheBogota)).toBe(true);
    });

    it('devuelve null para fechas LocalDateTime inválidas', () => {
        expect(obtenerEstadoTemporalEvento('2026-02-31T09:00:00', ahoraBogota)).toBeNull();
        expect(obtenerEstadoTemporalEvento('no-es-una-fecha', ahoraBogota)).toBeNull();
    });
});
