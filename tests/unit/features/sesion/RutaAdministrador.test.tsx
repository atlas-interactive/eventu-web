import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RutaAdministrador } from '../../../../src/features/sesion/RutaAdministrador';
import { guardarSesion } from '../../../../src/features/sesion/sesion';

const renderizar = () =>
    render(
        <MemoryRouter initialEntries={['/admin/categorias']}>
            <Routes>
                <Route element={<RutaAdministrador />}>
                    <Route path="/admin/categorias" element={<p>Pantalla de categorías</p>} />
                </Route>
                <Route path="/login" element={<p>Pantalla de login</p>} />
                <Route path="/no-autorizado" element={<p>Sin permiso</p>} />
            </Routes>
        </MemoryRouter>,
    );

describe('RutaAdministrador', () => {
    beforeEach(() => localStorage.clear());
    afterEach(cleanup);

    // Escenario 4: solo ADMIN
    it('deja pasar a un administrador', () => {
        guardarSesion({ token: 't', usuarioId: 1, nombre: 'Admin', correo: 'a@unillanos.edu.co', rol: 'ADMIN' });

        renderizar();

        expect(screen.getByText('Pantalla de categorías')).toBeInTheDocument();
    });

    it('envía a quien no es administrador a la pantalla de sin permiso', () => {
        guardarSesion({ token: 't', usuarioId: 2, nombre: 'Ana', correo: 'ana@unillanos.edu.co', rol: 'USUARIO' });

        renderizar();

        expect(screen.getByText('Sin permiso')).toBeInTheDocument();
    });

    it('envía al login cuando no hay sesión', () => {
        renderizar();

        expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
    });
});