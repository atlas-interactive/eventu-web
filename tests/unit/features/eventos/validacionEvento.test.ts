import { describe, expect, it } from 'vitest';
import { validarEvento } from '../../../../src/features/eventos/validacionEvento';
import type { CamposEvento } from '../../../../src/features/eventos/validacionEvento';

const AHORA = new Date('2026-10-10T10:00:00');

const validos: CamposEvento = {
    titulo: 'Feria de ciencia',
    descripcion: 'Proyectos de los estudiantes',
    fechaInicio: '2026-10-20T14:30',
    ubicacion: 'Auditorio principal',
    cuposMaximos: '50',
    categoriaId: '2',
};

describe('validarEvento', () => {
    // HU-05, criterio 1.0: datos válidos
    it('no reporta errores con datos válidos', () => {
        expect(validarEvento(validos, { ahora: AHORA })).toEqual({});
    });

    it('exige título, descripción, ubicación, categoría y fecha', () => {
        const errores = validarEvento(
            { titulo: '  ', descripcion: '', fechaInicio: '', ubicacion: ' ', cuposMaximos: '5', categoriaId: '' },
            { ahora: AHORA },
        );

        expect(errores.titulo).toBe('El título es obligatorio.');
        expect(errores.descripcion).toBe('La descripción es obligatoria.');
        expect(errores.fechaInicio).toBe('La fecha y hora de inicio son obligatorias.');
        expect(errores.ubicacion).toBe('La ubicación es obligatoria.');
        expect(errores.categoriaId).toBe('La categoría es obligatoria.');
    });

    it('rechaza una fecha pasada', () => {
        const errores = validarEvento({ ...validos, fechaInicio: '2026-10-01T09:00' }, { ahora: AHORA });

        expect(errores.fechaInicio).toBe('La fecha de inicio debe ser futura.');
    });

    it('no exige fecha futura al editar si la fecha no cambió', () => {
        const errores = validarEvento(
            { ...validos, fechaInicio: '2026-10-01T09:00' },
            { ahora: AHORA, fechaOriginal: '2026-10-01T09:00' },
        );

        expect(errores.fechaInicio).toBeUndefined();
    });

    it.each(['0', '-3', '2.5', 'abc'])('rechaza el cupo %s', (cupo) => {
        const errores = validarEvento({ ...validos, cuposMaximos: cupo }, { ahora: AHORA });

        expect(errores.cuposMaximos).toBe('El cupo máximo debe ser mayor a cero.');
    });

    it('exige el cupo', () => {
        expect(validarEvento({ ...validos, cuposMaximos: '' }, { ahora: AHORA }).cuposMaximos).toBe(
            'El cupo máximo es obligatorio.',
        );
    });

    it('limita título y ubicación a 150 caracteres', () => {
        const errores = validarEvento(
            { ...validos, titulo: 'a'.repeat(151), ubicacion: 'b'.repeat(151) },
            { ahora: AHORA },
        );

        expect(errores.titulo).toContain('150');
        expect(errores.ubicacion).toContain('150');
    });

    // HU-06: cupo menor que inscritos
    it('rechaza un cupo menor que los inscritos indicando cuántos son', () => {
        const errores = validarEvento({ ...validos, cuposMaximos: '10' }, { ahora: AHORA, inscritos: 20 });

        expect(errores.cuposMaximos).toBe(
            'No se puede reducir la capacidad por debajo de los inscritos actuales (20).',
        );
    });

    it('acepta un cupo igual a los inscritos', () => {
        expect(validarEvento({ ...validos, cuposMaximos: '20' }, { ahora: AHORA, inscritos: 20 })).toEqual({});
    });
});
