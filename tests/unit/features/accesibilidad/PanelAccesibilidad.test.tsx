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
        delete document.documentElement.dataset.accesibilidadTema;
        delete document.documentElement.dataset.accesibilidadContraste;
        delete document.documentElement.dataset.accesibilidadFuente;
        delete document.documentElement.dataset.accesibilidadEscala;
        document.documentElement.style.removeProperty('--accesibilidad-escala-texto');
    });

    it('aplica y persiste tamaño, contraste y tipografía seleccionados', async () => {
        const user = userEvent.setup();
        renderizar();

        expect(document.querySelectorAll('[role="dialog"] svg[aria-hidden="true"]')).toHaveLength(2);
        await user.click(screen.getByRole('button', { name: 'Aumentar tamaño de fuente' }));
        await user.click(screen.getByRole('button', { name: 'Aumentar tamaño de fuente' }));
        await user.selectOptions(screen.getByLabelText('Nivel de contraste'), 'alto');
        await user.selectOptions(screen.getByLabelText('Tipografía'), 'sistema');

        expect(document.documentElement.style.getPropertyValue('--accesibilidad-escala-texto')).toBe('1.5');
        expect(document.documentElement).toHaveAttribute('data-accesibilidad-tema', 'claro');
        expect(document.documentElement).toHaveAttribute('data-accesibilidad-contraste', 'alto');
        expect(document.documentElement).toHaveAttribute('data-accesibilidad-fuente', 'sistema');
        expect(JSON.parse(localStorage.getItem(CLAVE_PREFERENCIAS_ACCESIBILIDAD) ?? '{}')).toEqual({
            escalaTexto: 1.5,
            tema: 'claro',
            contraste: 'alto',
            fuente: 'sistema',
        });
    });

    it('carga preferencias, permite reducir o volver al tamaño predeterminado y aceptar', async () => {
        localStorage.setItem(
            CLAVE_PREFERENCIAS_ACCESIBILIDAD,
            JSON.stringify({ escalaTexto: 1.5, tema: 'oscuro', contraste: 'alto', fuente: 'sistema' }),
        );
        const user = userEvent.setup();
        const onCerrar = vi.fn();
        render(
            <AccesibilidadProvider>
                <PanelAccesibilidad onCerrar={onCerrar} elementoFocoRestaurar={null} />
            </AccesibilidadProvider>,
        );

        expect(document.documentElement.style.getPropertyValue('--accesibilidad-escala-texto')).toBe('1.5');
        expect(document.documentElement).toHaveAttribute('data-accesibilidad-tema', 'oscuro');
        expect(screen.getByLabelText('Nivel de contraste')).toHaveValue('alto');
        expect(screen.getByLabelText('Tipografía')).toHaveValue('sistema');

        await user.click(screen.getByRole('button', { name: 'Reducir tamaño de fuente' }));
        expect(document.documentElement.style.getPropertyValue('--accesibilidad-escala-texto')).toBe('1.25');
        await user.click(screen.getByRole('button', { name: 'Tamaño de fuente predeterminado' }));
        expect(document.documentElement.style.getPropertyValue('--accesibilidad-escala-texto')).toBe('1');

        await user.click(screen.getByRole('button', { name: 'Aceptar' }));
        expect(onCerrar).toHaveBeenCalledOnce();
        expect(screen.getByLabelText('Nivel de contraste')).toHaveValue('alto');
        expect(screen.getByLabelText('Tipografía')).toHaveValue('sistema');
    });

    it('limita el tamaño a los extremos y permite reducir por debajo del predeterminado', async () => {
        localStorage.setItem(
            CLAVE_PREFERENCIAS_ACCESIBILIDAD,
            JSON.stringify({ escalaTexto: 1, tema: 'claro', contraste: 'normal', fuente: 'atkinson' }),
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

    it('migra preferencias antiguas de colores invertidos al tema oscuro', () => {
        localStorage.setItem(
            CLAVE_PREFERENCIAS_ACCESIBILIDAD,
            JSON.stringify({ escalaTexto: 1.25, contraste: 'invertido', fuente: 'sistema' }),
        );
        renderizar();

        expect(document.documentElement).toHaveAttribute('data-accesibilidad-tema', 'oscuro');
        expect(document.documentElement).toHaveAttribute('data-accesibilidad-contraste', 'normal');
        expect(screen.getByLabelText('Nivel de contraste')).toHaveValue('normal');
        expect(screen.getByLabelText('Tipografía')).toHaveValue('sistema');
    });

    it('migra el alto contraste antiguo al tema claro', () => {
        localStorage.setItem(
            CLAVE_PREFERENCIAS_ACCESIBILIDAD,
            JSON.stringify({ escalaTexto: 1.25, contraste: 'alto', fuente: 'atkinson' }),
        );
        renderizar();

        expect(document.documentElement).toHaveAttribute('data-accesibilidad-tema', 'claro');
        expect(document.documentElement).toHaveAttribute('data-accesibilidad-contraste', 'alto');
        expect(screen.getByLabelText('Nivel de contraste')).toHaveValue('alto');
    });
});
