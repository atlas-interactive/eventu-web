import { act, render, screen } from '@testing-library/react';
import { lazy, Suspense, type ComponentType } from 'react';
import { describe, expect, it } from 'vitest';
import { Skeleton, SkeletonAutenticacion, SkeletonEstado, SkeletonPagina } from '../../../src/components/ui/Skeleton';

describe('Skeleton', () => {
    it('conserva un único main al pasar de la carga de ruta a su contenido', async () => {
        let completarCarga!: (modulo: { default: ComponentType }) => void;
        const Pagina = lazy(() => new Promise<{ default: ComponentType }>((resolve) => {
            completarCarga = resolve;
        }));
        render(
            <Suspense fallback={<SkeletonPagina />}>
                <Pagina />
            </Suspense>,
        );

        expect(screen.getAllByRole('main')).toHaveLength(1);
        expect(screen.getByRole('main')).toContainElement(
            screen.getByRole('status', { name: 'Cargando pantalla' }),
        );

        await act(async () => {
            completarCarga({ default: () => <main><h1>Página cargada</h1></main> });
        });

        expect(document.querySelectorAll('main')).toHaveLength(1);
        expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { name: 'Página cargada' }));
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

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
