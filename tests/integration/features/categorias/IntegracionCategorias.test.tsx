import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { AppRoutes } from '../../../../src/routes/AppRoutes';
import { guardarSesion } from '../../../../src/features/sesion/sesion';
import { server } from '../../../mocks/server';
import type { Categoria } from '../../../../src/types/categoria';

// Backend simulado con memoria: valida nombres duplicados como el real
let categorias: Categoria[];

const categoria = (id: number, nombre: string, activo = true): Categoria => ({
    id,
    nombre,
    activo,
    creadoEn: '2026-01-10T08:00:00',
    eventosActivos: 0,
});

const existe = (nombre: string, id?: number) =>
    categorias.some((c) => c.nombre.toLowerCase() === nombre.trim().toLowerCase() && c.id !== id);

const usarBackendSimulado = () =>
    server.use(
        http.get('*/categorias', () => HttpResponse.json(categorias)),
        http.post('*/categorias', async ({ request }) => {
            const { nombre } = (await request.json()) as { nombre: string };
            if (existe(nombre)) {
                return HttpResponse.json({ error: 'Ya existe una categoría con ese nombre.' }, { status: 409 });
            }
            const nueva = categoria(categorias.length + 1, nombre.trim());
            categorias.push(nueva);
            return HttpResponse.json(nueva, { status: 201 });
        }),
        http.patch('*/categorias/:id/desactivar', ({ params }) => {
            categorias = categorias.map((c) => (c.id === Number(params.id) ? { ...c, activo: false } : c));
            return HttpResponse.json(categorias.find((c) => c.id === Number(params.id)));
        }),
    );

const abrir = () =>
    render(
        <MemoryRouter initialEntries={['/admin/categorias']}>
            <AppRoutes />
        </MemoryRouter>,
    );

const crear = async (usuario: ReturnType<typeof userEvent.setup>, nombre: string) => {
    await usuario.click(await screen.findByRole('button', { name: /Nueva categoría/ }));
    await usuario.type(screen.getByLabelText('Nombre de la categoría'), nombre);
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));
};

// Más tiempo: la primera carga de las pantallas es lenta cuando se mide la cobertura
describe('Gestión de categorías (HU-04)', { timeout: 15000 }, () => {
    beforeEach(() => {
        localStorage.clear();
        categorias = [categoria(1, 'Académico'), categoria(2, 'Cultural')];
        guardarSesion({ token: 'token-admin', usuarioId: 1, nombre: 'Administrador', correo: 'admin@unillanos.edu.co', rol: 'ADMIN' });
        usarBackendSimulado();
    });

    it('crea una categoría nueva y la muestra en el listado', async () => {
        const usuario = userEvent.setup({ delay: null });
        abrir();

        await crear(usuario, 'Robótica');

        expect(await screen.findByText('Robótica')).toBeInTheDocument();
        expect(await screen.findByRole('status')).toBeInTheDocument();
    });

    it('rechaza un nombre que ya existe sin importar mayúsculas', async () => {
        const usuario = userEvent.setup({ delay: null });
        abrir();

        await crear(usuario, 'cultural');

        expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe una categoría con ese nombre.');
        expect(categorias).toHaveLength(2);
    });

    it('desactiva una categoría después de confirmar', async () => {
        const usuario = userEvent.setup({ delay: null });
        abrir();

        await usuario.click(await screen.findByRole('button', { name: 'Desactivar categoría Cultural' }));
        const dialogo = screen.getByRole('dialog', { name: 'Desactivar categoría' });
        await usuario.click(within(dialogo).getByRole('button', { name: 'Desactivar' }));

        expect(await screen.findByRole('button', { name: 'Activar categoría Cultural' })).toBeInTheDocument();
        expect(categorias.find((c) => c.id === 2)?.activo).toBe(false);
    });
});
