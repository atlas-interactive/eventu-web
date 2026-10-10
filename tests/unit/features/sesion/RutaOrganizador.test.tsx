import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RutaOrganizador } from '../../../../src/features/sesion/RutaOrganizador';
import { guardarSesion } from '../../../../src/features/sesion/sesion';

const renderizar = () =>
    render(
        <MemoryRouter initialEntries={['/organizador/eventos']}>
            <Routes>
                <Route element={<RutaOrganizador />}>
                    <Route path="/organizador/eventos" element={<p>Pantalla de eventos</p>} />
                </Route>
                <Route path="/login" element={<p>Pantalla de login</p>} />
                <Route path="/no-autorizado" element={<p>Sin permiso</p>} />
            </Routes>
        </MemoryRouter>,
    );

const sesionCon = (rol: string) =>
    guardarSesion({ token: 't', usuarioId: 3, nombre: 'Luz', correo: 'luz@unillanos.edu.co', rol });

describe('RutaOrganizador', () => {
    beforeEach(() => localStorage.clear());
    afterEach(cleanup);

    it.each(['ORGANIZADOR', 'ADMIN'])('deja pasar al rol %s', (rol) => {
        sesionCon(rol);

        renderizar();

        expect(screen.getByText('Pantalla de eventos')).toBeInTheDocument();
    });

    it('envía a un usuario sin permisos a la pantalla de sin permiso', () => {
        sesionCon('USUARIO');

        renderizar();

        expect(screen.getByText('Sin permiso')).toBeInTheDocument();
    });

    it('envía al login cuando no hay sesión', () => {
        renderizar();

        expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
    });
});
