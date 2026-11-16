import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { AppRoutes } from '../../../../src/routes/AppRoutes';
import { guardarSesion } from '../../../../src/features/sesion/sesion';
import { server } from '../../../mocks/server';
import type { UsuarioBuscado } from '../../../../src/types/usuario';

// Backend simulado con memoria: el rol cambia y se refleja en las siguientes búsquedas
let usuarios: UsuarioBuscado[];

const cambiarRol = (id: number, rol: string, mensaje: string) => {
    usuarios = usuarios.map((u) => (u.id === id ? { ...u, rol } : u));
    return HttpResponse.json({ mensaje, usuarioId: id, rol });
};

const usarBackendSimulado = () =>
    server.use(
        http.get('*/usuarios/organizadores', () => HttpResponse.json(usuarios.filter((u) => u.rol === 'ORGANIZADOR'))),
        http.get('*/usuarios', ({ request }) => {
            const criterio = (new URL(request.url).searchParams.get('criterio') ?? '').toLowerCase();
            return HttpResponse.json(
                usuarios.filter((u) => u.nombre.toLowerCase().includes(criterio) || u.correo.includes(criterio)),
            );
        }),
        http.put('*/usuarios/:id/asignar-organizador', ({ params }) =>
            cambiarRol(Number(params.id), 'ORGANIZADOR', 'Rol de organizador asignado exitosamente.'),
        ),
        http.put('*/usuarios/:id/revocar-organizador', ({ params }) =>
            cambiarRol(Number(params.id), 'USUARIO', 'Rol de organizador revocado exitosamente.'),
        ),
    );

const abrir = () =>
    render(
        <MemoryRouter initialEntries={['/admin/usuarios']}>
            <AppRoutes />
        </MemoryRouter>,
    );

// Más tiempo: la primera carga de las pantallas es lenta cuando se mide la cobertura
describe('Asignación de organizadores (HU-03)', { timeout: 15000 }, () => {
    beforeEach(() => {
        localStorage.clear();
        usuarios = [
            { id: 4, nombre: 'Estudiante Uno', correo: 'estudiante1@unillanos.edu.co', rol: 'USUARIO' },
            { id: 8, nombre: 'Organizador Rev Uno', correo: 'org.rev1@unillanos.edu.co', rol: 'ORGANIZADOR' },
        ];
        guardarSesion({ token: 'token-admin', usuarioId: 1, nombre: 'Administrador', correo: 'admin@unillanos.edu.co', rol: 'ADMIN' });
        usarBackendSimulado();
    });

    it('busca un usuario y le asigna el rol de organizador', async () => {
        const usuario = userEvent.setup({ delay: null });
        abrir();

        await usuario.type(await screen.findByRole('searchbox'), 'Estudiante');
        await usuario.click(await screen.findByRole('button', { name: 'Asignar organizador a Estudiante Uno' }));

        expect(await screen.findByRole('status')).toHaveTextContent('Rol de organizador asignado exitosamente.');
        expect(usuarios.find((u) => u.id === 4)?.rol).toBe('ORGANIZADOR');
        expect(await screen.findByRole('button', { name: 'Revocar rol de organizador a Estudiante Uno' })).toBeInTheDocument();
    });

    it('revoca el rol de organizador después de confirmar', async () => {
        const usuario = userEvent.setup({ delay: null });
        abrir();

        await usuario.click(await screen.findByRole('button', { name: 'Revocar rol de Organizador Rev Uno' }));
        const dialogo = screen.getByRole('dialog', { name: '¿Revocar rol de organizador?' });
        await usuario.click(within(dialogo).getByRole('button', { name: 'Sí, revocar rol' }));

        expect(await screen.findByRole('status')).toHaveTextContent('Rol de organizador revocado exitosamente.');
        expect(usuarios.find((u) => u.id === 8)?.rol).toBe('USUARIO');
    });
});
