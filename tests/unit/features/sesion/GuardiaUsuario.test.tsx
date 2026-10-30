import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RutaUsuario } from '../../../../src/features/sesion/GuardiaRutaUsuario';
import { guardarSesion } from '../../../../src/features/sesion/sesion';

const renderizar = () =>
    render(
        <MemoryRouter initialEntries={['/usuario']}>
            <Routes>
                <Route element={<RutaUsuario />}>
                    <Route path="/usuario" element={<p>Inicio de usuario</p>} />
                </Route>
                <Route path="/login" element={<p>Pantalla de login</p>} />
                <Route path="/admin/categorias" element={<p>Pantalla de administrador</p>} />
                <Route path="/organizador/eventos" element={<p>Pantalla de organizador</p>} />
            </Routes>
        </MemoryRouter>,
    );

describe('RutaUsuario', () => {
    beforeEach(() => localStorage.clear());
    afterEach(cleanup);

    it('deja pasar a un usuario autenticado con rol USUARIO', () => {
        guardarSesion({ token: 't', usuarioId: 1, nombre: 'Ana', correo: 'ana@unillanos.edu.co', rol: 'USUARIO' });

        renderizar();

        expect(screen.getByText('Inicio de usuario')).toBeInTheDocument();
    });

    it('envía al login cuando no existe una sesión', () => {
        renderizar();

        expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
    });

    it.each([
        ['ADMIN', 'Pantalla de administrador'],
        ['ORGANIZADOR', 'Pantalla de organizador'],
    ])('redirige al inicio del rol %s cuando no corresponde al usuario', (rol, destino) => {
        guardarSesion({ token: 't', usuarioId: 1, nombre: 'Ana', correo: 'ana@unillanos.edu.co', rol });

        renderizar();

        expect(screen.getByText(destino)).toBeInTheDocument();
    });
});
