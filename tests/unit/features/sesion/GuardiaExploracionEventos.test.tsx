import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RutaExploracionEventos } from '../../../../src/features/sesion/GuardiaRutaExploracionEventos';
import { guardarSesion } from '../../../../src/features/sesion/sesion';

const renderizar = (rutaInicial = '/eventos') =>
    render(
        <MemoryRouter initialEntries={[rutaInicial]}>
            <Routes>
                <Route element={<RutaExploracionEventos />}>
                    <Route path="/eventos" element={<p>Catálogo de eventos</p>} />
                    <Route path="/mis-inscripciones" element={<p>Mis inscripciones</p>} />
                </Route>
                <Route path="/login" element={<p>Pantalla de login</p>} />
                <Route path="/no-autorizado" element={<p>Acceso no autorizado</p>} />
                <Route path="/admin/categorias" element={<p>Pantalla de administrador</p>} />
                <Route path="/organizador/eventos" element={<p>Pantalla de organizador</p>} />
                <Route path="/usuario/eventos" element={<p>Pantalla de usuario</p>} />
            </Routes>
        </MemoryRouter>,
    );

describe('RutaExploracionEventos', () => {
    beforeEach(() => localStorage.clear());
    afterEach(cleanup);

    it.each(['USUARIO', 'ORGANIZADOR'])('permite explorar eventos al rol %s', (rol) => {
        guardarSesion({ token: 't', usuarioId: 1, nombre: 'Ana', correo: 'ana@unillanos.edu.co', rol });

        renderizar();

        expect(screen.getByText('Catálogo de eventos')).toBeInTheDocument();
    });

    it('envía al login cuando no existe una sesión', () => {
        renderizar();

        expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
    });

    it('deniega el acceso al administrador', () => {
        guardarSesion({ token: 't', usuarioId: 1, nombre: 'Ana', correo: 'ana@unillanos.edu.co', rol: 'ADMIN' });

        renderizar();

        expect(screen.getByText('Acceso no autorizado')).toBeInTheDocument();
    });

    it.each(['USUARIO', 'ORGANIZADOR'])('permite ver las inscripciones al rol %s', (rol) => {
        guardarSesion({ token: 't', usuarioId: 1, nombre: 'Ana', correo: 'ana@unillanos.edu.co', rol });

        renderizar('/mis-inscripciones');

        expect(screen.getByText('Mis inscripciones')).toBeInTheDocument();
    });

    it('deniega las inscripciones al administrador', () => {
        guardarSesion({ token: 't', usuarioId: 1, nombre: 'Ana', correo: 'ana@unillanos.edu.co', rol: 'ADMIN' });

        renderizar('/mis-inscripciones');

        expect(screen.getByText('Acceso no autorizado')).toBeInTheDocument();
    });
});
