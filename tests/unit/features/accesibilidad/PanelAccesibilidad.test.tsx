import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccesibilidadProvider } from '../../../../src/features/accesibilidad/AccesibilidadProvider';
import { PanelAccesibilidad } from '../../../../src/features/accesibilidad/PanelAccesibilidad';
import { CLAVE_PREFERENCIAS_ACCESIBILIDAD } from '../../../../src/features/accesibilidad/preferenciasAccesibilidad';

const renderizar = () =>
    render(
        <AccesibilidadProvider>
            <PanelAccesibilidad onCerrar={() => undefined} elementoFocoRestaurar={null} />
        </AccesibilidadProvider>,
    );

describe('PanelAccesibilidad', () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => {
        cleanup();
        delete document.documentElement.dataset.accesibilidadContraste;
        delete document.documentElement.dataset.accesibilidadFuente;
        delete document.documentElement.dataset.accesibilidadEscala;
        document.documentElement.style.removeProperty('--accesibilidad-escala-texto');
    });

    it('aplica y persiste tamaño, contraste y tipografía seleccionados', async () => {
        const user = userEvent.setup();
        renderizar();

        await user.click(screen.getByRole('button', { name: 'Aumentar tamaño de fuente' }));
        await user.click(screen.getByRole('button', { name: 'Aumentar tamaño de fuente' }));
        await user.selectOptions(screen.getByLabelText('Contraste y colores'), 'alto');
        await user.selectOptions(screen.getByLabelText('Tipografía'), 'sistema');

        expect(document.documentElement.style.getPropertyValue('--accesibilidad-escala-texto')).toBe('1.5');
        expect(document.documentElement).toHaveAttribute('data-accesibilidad-contraste', 'alto');
        expect(document.documentElement).toHaveAttribute('data-accesibilidad-fuente', 'sistema');
        expect(JSON.parse(localStorage.getItem(CLAVE_PREFERENCIAS_ACCESIBILIDAD) ?? '{}')).toEqual({
            escalaTexto: 1.5,
            contraste: 'alto',
            fuente: 'sistema',
        });
    });

    it('carga preferencias, permite reducir o volver al tamaño predeterminado y aceptar', async () => {
        localStorage.setItem(
            CLAVE_PREFERENCIAS_ACCESIBILIDAD,
            JSON.stringify({ escalaTexto: 1.5, contraste: 'invertido', fuente: 'sistema' }),
        );
        const user = userEvent.setup();
        const onCerrar = vi.fn();
        render(
            <AccesibilidadProvider>
                <PanelAccesibilidad onCerrar={onCerrar} elementoFocoRestaurar={null} />
            </AccesibilidadProvider>,
        );

        expect(document.documentElement.style.getPropertyValue('--accesibilidad-escala-texto')).toBe('1.5');
        expect(screen.getByLabelText('Contraste y colores')).toHaveValue('invertido');
        expect(screen.getByLabelText('Tipografía')).toHaveValue('sistema');

        await user.click(screen.getByRole('button', { name: 'Reducir tamaño de fuente' }));
        expect(document.documentElement.style.getPropertyValue('--accesibilidad-escala-texto')).toBe('1.25');
        await user.click(screen.getByRole('button', { name: 'Tamaño de fuente predeterminado' }));
        expect(document.documentElement.style.getPropertyValue('--accesibilidad-escala-texto')).toBe('1');

        await user.click(screen.getByRole('button', { name: 'Aceptar' }));
        expect(onCerrar).toHaveBeenCalledOnce();
        expect(screen.getByLabelText('Contraste y colores')).toHaveValue('invertido');
        expect(screen.getByLabelText('Tipografía')).toHaveValue('sistema');
    });

    it('limita el tamaño a los extremos y permite reducir por debajo del predeterminado', async () => {
        localStorage.setItem(
            CLAVE_PREFERENCIAS_ACCESIBILIDAD,
            JSON.stringify({ escalaTexto: 1, contraste: 'normal', fuente: 'atkinson' }),
        );
        const user = userEvent.setup();
        renderizar();

        await user.click(screen.getByRole('button', { name: 'Reducir tamaño de fuente' }));
        expect(document.documentElement.style.getPropertyValue('--accesibilidad-escala-texto')).toBe('0.75');
        expect(screen.getByRole('button', { name: 'Reducir tamaño de fuente' })).toBeDisabled();

        for (let i = 0; i < 4; i += 1) {
            await user.click(screen.getByRole('button', { name: 'Aumentar tamaño de fuente' }));
        }
        expect(document.documentElement.style.getPropertyValue('--accesibilidad-escala-texto')).toBe('2');
        expect(screen.getByRole('button', { name: 'Aumentar tamaño de fuente' })).toBeDisabled();
    });
});
