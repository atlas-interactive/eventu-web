import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GestionCategorias } from '../../../../src/features/categorias/GestionCategorias';
import {
    activarCategoria,
    crearCategoria,
    desactivarCategoria,
    editarCategoria,
    listarCategorias,
} from '../../../../src/features/categorias/services/categoriaService';
import { guardarSesion } from '../../../../src/features/sesion/sesion';
import type { Categoria } from '../../../../src/types/categoria';

vi.mock('../../../../src/features/categorias/services/categoriaService', () => ({
    listarCategorias: vi.fn(),
    crearCategoria: vi.fn(),
    editarCategoria: vi.fn(),
    desactivarCategoria: vi.fn(),
    activarCategoria: vi.fn(),
}));

const listarMock = vi.mocked(listarCategorias);
const crearMock = vi.mocked(crearCategoria);
const editarMock = vi.mocked(editarCategoria);
const desactivarMock = vi.mocked(desactivarCategoria);
const activarMock = vi.mocked(activarCategoria);

const ADMIN_ID = 1;

const categoria = (id: number, nombre: string, activo: boolean, eventosActivos: number): Categoria => ({
    id,
    nombre,
    activo,
    eventosActivos,
    creadoEn: '2026-10-01T10:00:00',
});

const CATEGORIAS = [
    categoria(1, 'Académico', true, 8),
    categoria(2, 'Cultural', true, 3),
    categoria(3, 'Bienestar Universitario', false, 0),
];

// Simula el error que devuelve el backend, por ejemplo {"error": "..."} con estado 409
const errorHttp = (status: number, mensaje: string) =>
    new AxiosError('fallo', 'ERR_BAD_REQUEST', undefined, undefined, {
        status,
        data: { error: mensaje },
    } as AxiosResponse);

const renderizar = async () => {
    render(<GestionCategorias />);
    await screen.findByText('Cultural');
};

describe('GestionCategorias (HU-04)', () => {
    afterEach(cleanup);

    beforeEach(() => {
        localStorage.clear();
        guardarSesion({ token: 't', usuarioId: ADMIN_ID, nombre: 'Admin', correo: 'admin@unillanos.edu.co', rol: 'ADMIN' });
        listarMock.mockReset().mockResolvedValue(CATEGORIAS);
        crearMock.mockReset();
        editarMock.mockReset();
        desactivarMock.mockReset();
        activarMock.mockReset();
    });

    it('lista todas las categorías con su estado y los eventos activos', async () => {
        await renderizar();

        // Pide todas (activas e inactivas): el panel de administración no filtra
        expect(listarMock).toHaveBeenCalledWith(false);
        const fila = screen.getByText('Académico').closest('tr') as HTMLElement;
        expect(within(fila).getByText('8 eventos')).toBeInTheDocument();
        expect(within(fila).getByText('Activa')).toBeInTheDocument();
        const inactiva = screen.getByText('Bienestar Universitario').closest('tr') as HTMLElement;
        expect(within(inactiva).getByText('Inactiva')).toBeInTheDocument();
        expect(within(inactiva).getByRole('button', { name: /^Activar categoría/ })).toBeInTheDocument();
    });

    // Escenario 1: crear
    it('crea una categoría con nombre disponible, avisa y recarga el listado', async () => {
        const user = userEvent.setup();
        crearMock.mockResolvedValue(categoria(4, 'Deportivo', true, 0));
        await renderizar();

        await user.click(screen.getByRole('button', { name: /Nueva categoría/ }));
        await user.type(screen.getByLabelText('Nombre de la categoría'), '  Deportivo  ');
        await user.click(screen.getByRole('button', { name: 'Guardar' }));

        expect(crearMock).toHaveBeenCalledWith({ nombre: 'Deportivo' });
        expect(await screen.findByRole('status')).toHaveTextContent('Categoría creada correctamente.');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        await waitFor(() => expect(listarMock).toHaveBeenCalledTimes(2));
    });

    it('muestra el error de nombre duplicado al crear y deja abierto el formulario', async () => {
        const user = userEvent.setup();
        crearMock.mockRejectedValue(errorHttp(409, 'Ya existe una categoría con ese nombre.'));
        await renderizar();

        await user.click(screen.getByRole('button', { name: /Nueva categoría/ }));
        await user.type(screen.getByLabelText('Nombre de la categoría'), 'cultural');
        await user.click(screen.getByRole('button', { name: 'Guardar' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe una categoría con ese nombre.');
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByLabelText('Nombre de la categoría')).toHaveAttribute('aria-invalid', 'true');
    });

    it('no llama al servicio si el nombre está vacío', async () => {
        const user = userEvent.setup();
        await renderizar();

        await user.click(screen.getByRole('button', { name: /Nueva categoría/ }));
        await user.type(screen.getByLabelText('Nombre de la categoría'), '   ');
        await user.click(screen.getByRole('button', { name: 'Guardar' }));

        expect(screen.getByRole('alert')).toHaveTextContent('El nombre de la categoría es obligatorio.');
        expect(crearMock).not.toHaveBeenCalled();
    });

    // Escenario 2: editar el nombre
    it('edita el nombre sin enviar el estado', async () => {
        const user = userEvent.setup();
        editarMock.mockResolvedValue(categoria(2, 'Arte', true, 3));
        await renderizar();

        await user.click(screen.getByRole('button', { name: 'Editar categoría Cultural' }));
        const campo = screen.getByLabelText('Nombre de la categoría');
        expect(campo).toHaveValue('Cultural');
        await user.clear(campo);
        await user.type(campo, 'Arte');
        await user.click(screen.getByRole('button', { name: 'Guardar' }));

        expect(editarMock).toHaveBeenCalledWith(2, { nombre: 'Arte' });
        expect(await screen.findByRole('status')).toHaveTextContent('Categoría actualizada correctamente.');
    });

    it('muestra el error al editar con el nombre de otra categoría', async () => {
        const user = userEvent.setup();
        editarMock.mockRejectedValue(errorHttp(409, 'Ya existe una categoría con ese nombre.'));
        await renderizar();

        await user.click(screen.getByRole('button', { name: 'Editar categoría Cultural' }));
        const campo = screen.getByLabelText('Nombre de la categoría');
        await user.clear(campo);
        await user.type(campo, 'académico');
        await user.click(screen.getByRole('button', { name: 'Guardar' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe una categoría con ese nombre.');
    });

    // Escenario 3: desactivar y reactivar
    it('pide confirmación al desactivar, aclara que los eventos conservan la categoría y envía activo=false', async () => {
        const user = userEvent.setup();
        desactivarMock.mockResolvedValue(categoria(2, 'Cultural', false, 3));
        await renderizar();

        await user.click(screen.getByRole('button', { name: 'Desactivar categoría Cultural' }));
        const dialogo = screen.getByRole('dialog', { name: 'Desactivar categoría' });
        expect(dialogo).toHaveTextContent('Los 3 eventos activos que ya la usan conservarán su categoría.');
        expect(desactivarMock).not.toHaveBeenCalled();

        await user.click(within(dialogo).getByRole('button', { name: 'Desactivar' }));

        // Solo viaja el id: no se reenvía el nombre
        expect(desactivarMock).toHaveBeenCalledWith(2);
        expect(editarMock).not.toHaveBeenCalled();
        expect(await screen.findByRole('status')).toHaveTextContent('Categoría desactivada correctamente.');
    });

    it('reactiva una categoría inactiva', async () => {
        const user = userEvent.setup();
        activarMock.mockResolvedValue(categoria(3, 'Bienestar Universitario', true, 0));
        await renderizar();

        await user.click(screen.getByRole('button', { name: 'Activar categoría Bienestar Universitario' }));
        await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Activar' }));

        expect(activarMock).toHaveBeenCalledWith(3);
        expect(await screen.findByRole('status')).toHaveTextContent('Categoría activada correctamente.');
    });

    it('cancelar la confirmación no modifica nada', async () => {
        const user = userEvent.setup();
        await renderizar();

        await user.click(screen.getByRole('button', { name: 'Desactivar categoría Cultural' }));
        await user.click(screen.getByRole('button', { name: 'Cancelar' }));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(desactivarMock).not.toHaveBeenCalled();
    });

    // Accesibilidad
    it('cierra el diálogo con Escape y devuelve el foco al botón que lo abrió', async () => {
        const user = userEvent.setup();
        await renderizar();

        const abrir = screen.getByRole('button', { name: /Nueva categoría/ });
        await user.click(abrir);
        expect(screen.getByLabelText('Nombre de la categoría')).toHaveFocus();

        await user.keyboard('{Escape}');

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(abrir).toHaveFocus();
    });

    it('avisa cuando no se pudo cargar el listado', async () => {
        listarMock.mockRejectedValue(new Error('sin red'));
        render(<GestionCategorias />);

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Ocurrió un error inesperado al conectar con el servidor.',
        );
    });
});