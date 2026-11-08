import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TablaActividadSkeleton } from '../../../../src/features/actividad/components/TablaActividadSkeleton';

describe('TablaActividadSkeleton', () => {
    it('muestra filas de carga con las columnas del registro de actividad', () => {
        render(<TablaActividadSkeleton />);

        expect(screen.getByRole('status', { name: 'Cargando registros de actividad' })).toHaveAttribute(
            'aria-busy',
            'true',
        );
        expect(screen.getAllByRole('row')).toHaveLength(7);
        expect(screen.getAllByRole('columnheader')).toHaveLength(6);
        expect(screen.getByText('Solo lectura: los registros no se pueden editar ni eliminar.')).toBeInTheDocument();

        const primeraFila = screen.getAllByRole('row')[1];
        expect(within(primeraFila).getAllByRole('cell')).toHaveLength(6);
        expect(within(primeraFila).getAllByRole('cell')[0]).toHaveAttribute('data-label', 'Fecha y hora');
    });
});
