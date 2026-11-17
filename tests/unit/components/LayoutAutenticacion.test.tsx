import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { LayoutAutenticacion } from '../../../src/components/layout/LayoutAutenticacion';
import { AccesibilidadProvider } from '../../../src/features/accesibilidad/AccesibilidadProvider';
import { CLAVE_PREFERENCIAS_ACCESIBILIDAD } from '../../../src/features/accesibilidad/preferenciasAccesibilidad';

const renderizar = () => render(
    <AccesibilidadProvider>
        <MemoryRouter initialEntries={['/login']}>
            <Routes>
                <Route element={<LayoutAutenticacion />}>
                    <Route path="/login" element={<Link to="/registro">Crear cuenta</Link>} />
                    <Route path="/registro" element={<h1>Registro</h1>} />
                </Route>
            </Routes>
        </MemoryRouter>
    </AccesibilidadProvider>,
);

describe('LayoutAutenticacion', () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => {
        cleanup();
        for (const atributo of ['tema', 'contraste', 'fuente', 'escala']) {
            document.documentElement.removeAttribute(`data-accesibilidad-${atributo}`);
        }
        document.documentElement.style.removeProperty('--accesibilidad-escala-texto');
    });

    it('cambia y persiste el tema antes de iniciar sesión y lo mantiene al navegar', async () => {
        const user = userEvent.setup();
        renderizar();

        await user.click(screen.getByRole('button', { name: 'Activar tema oscuro' }));
        expect(document.documentElement).toHaveAttribute('data-accesibilidad-tema', 'oscuro');
        expect(JSON.parse(localStorage.getItem(CLAVE_PREFERENCIAS_ACCESIBILIDAD) ?? '{}').tema).toBe('oscuro');

        await user.click(screen.getByRole('link', { name: 'Crear cuenta' }));
        expect(screen.getByRole('heading', { name: 'Registro' })).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Activar tema claro' }));
        expect(document.documentElement).toHaveAttribute('data-accesibilidad-tema', 'claro');
    });

    it('abre el panel con teclado, aplica preferencias y devuelve el foco al cerrar', async () => {
        const user = userEvent.setup();
        renderizar();
        const boton = screen.getByRole('button', { name: 'Accesibilidad' });

        await user.tab();
        expect(boton).toHaveFocus();
        await user.keyboard('{Enter}');
        expect(screen.getByRole('dialog', { name: 'Opciones de accesibilidad' })).toBeInTheDocument();
        expect(boton).toHaveAttribute('aria-expanded', 'true');
        await user.selectOptions(screen.getByLabelText('Nivel de contraste'), 'alto');
        expect(document.documentElement).toHaveAttribute('data-accesibilidad-contraste', 'alto');
        await user.keyboard('{Escape}');

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(boton).toHaveFocus();
        expect(boton).toHaveAttribute('aria-expanded', 'false');
    });
});
