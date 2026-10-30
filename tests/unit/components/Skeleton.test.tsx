import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton, SkeletonAutenticacion, SkeletonEstado, SkeletonPagina } from '../../../src/components/ui/Skeleton';

describe('Skeleton', () => {
    it('expone el estado de carga de manera accesible', () => {
        render(
            <SkeletonEstado etiqueta="Cargando datos">
                <Skeleton className="h-4 w-full" />
            </SkeletonEstado>,
        );

        expect(screen.getByRole('status', { name: 'Cargando datos' })).toHaveAttribute('aria-busy', 'true');
        expect(screen.getByText('Cargando datos')).toHaveClass('sr-only');
        expect(document.querySelector('.animate-pulse')).toHaveAttribute('aria-hidden', 'true');
    });

    it.each([
        [<SkeletonPagina />, 'Cargando pantalla'],
        [<SkeletonAutenticacion />, 'Cargando formulario'],
    ])('incluye un estado de carga accesible para una pantalla', (componente, etiqueta) => {
        render(componente);

        expect(screen.getByRole('status', { name: etiqueta })).toHaveAttribute('aria-busy', 'true');
    });
});
