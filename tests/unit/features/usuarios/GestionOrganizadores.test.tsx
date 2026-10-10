import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GestionOrganizadores } from '../../../../src/features/usuarios/GestionOrganizadores';
import {
    asignarOrganizador,
    buscarUsuarios,
    listarOrganizadores,
    revocarOrganizador,
} from '../../../../src/features/usuarios/services/usuarioService';
import type { UsuarioBuscado } from '../../../../src/types/usuario';

vi.mock('../../../../src/features/usuarios/services/usuarioService', () => ({
    buscarUsuarios: vi.fn(),
    listarOrganizadores: vi.fn(),
    asignarOrganizador: vi.fn(),
    revocarOrganizador: vi.fn(),
}));

const buscarMock = vi.mocked(buscarUsuarios);
const listarMock = vi.mocked(listarOrganizadores);
const asignarMock = vi.mocked(asignarOrganizador);
const revocarMock = vi.mocked(revocarOrganizador);

const usuario = (id: number, nombre: string, rol: string): UsuarioBuscado => ({
    id,
    nombre,
    correo: `${nombre.split(' ')[0].toLowerCase()}@unillanos.edu.co`,
    rol,
});

// Simula el error que devuelve el backend, por ejemplo {"error": "..."} con estado 404
const errorHttp = (status: number, mensaje: string) =>
    new AxiosError('fallo', 'ERR_BAD_REQUEST', undefined, undefined, {
        status,
        data: { error: mensaje },
    } as AxiosResponse);

// Escribe en el buscador; la búsqueda se dispara sola cuando se deja de teclear (no hay botón Buscar)
const buscar = async (texto: string) => {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Buscar por nombre o correo institucional'), texto);
    return user;
};

describe('GestionOrganizadores (HU-03)', () => {
    beforeEach(() => {
        buscarMock.mockReset();
        asignarMock.mockReset();
        revocarMock.mockReset();
        listarMock.mockReset();
        listarMock.mockResolvedValue([]);
    });
    afterEach(cleanup);

    // Escenario 1.0
    it('muestra el usuario encontrado con su rol actual', async () => {
        buscarMock.mockResolvedValue([usuario(4, 'Laura Gomez', 'USUARIO')]);
        render(<GestionOrganizadores />);

        await buscar('laura');

        expect(await screen.findByText('Laura Gomez')).toBeInTheDocument();
        expect(screen.getByText(/laura@unillanos.edu.co · Usuario/)).toBeInTheDocument();
        expect(buscarMock).toHaveBeenCalledWith('laura');
    });

    it('indica que no se encontró ningún usuario', async () => {
        buscarMock.mockRejectedValue(errorHttp(404, 'No se encontró ningún usuario con ese criterio.'));
        render(<GestionOrganizadores />);

        await buscar('zzz');

        expect(await screen.findByText('No se encontró ningún usuario con ese criterio.')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('muestra como error un fallo distinto de "no encontrado"', async () => {
        buscarMock.mockRejectedValue(errorHttp(500, 'Error interno del servidor.'));
        render(<GestionOrganizadores />);

        await buscar('laura');

        expect(await screen.findByRole('alert')).toHaveTextContent('Error interno del servidor.');
    });

    it('no busca con menos de 2 caracteres', async () => {
        render(<GestionOrganizadores />);

        await buscar('l');
        await new Promise((r) => setTimeout(r, 500));

        expect(buscarMock).not.toHaveBeenCalled();
        expect(screen.getByText(/Solo se muestran usuarios que ya están registrados/)).toBeInTheDocument();
    });

    it('espera a que se deje de escribir y hace una sola búsqueda', async () => {
        buscarMock.mockResolvedValue([usuario(4, 'Laura Gomez', 'USUARIO')]);
        render(<GestionOrganizadores />);

        await buscar('laura');

        expect(await screen.findByText('Laura Gomez')).toBeInTheDocument();
        expect(buscarMock).toHaveBeenCalledTimes(1);
        expect(screen.getByText('1 coincidencia')).toBeInTheDocument();
    });

    // Tabla de organizadores actuales
    it('lista en una tabla los organizadores actuales al entrar', async () => {
        listarMock.mockResolvedValue([usuario(5, 'Martin Pineda', 'ORGANIZADOR'), usuario(6, 'Sofia Rojas', 'ORGANIZADOR')]);
        render(<GestionOrganizadores />);

        const tabla = await screen.findByRole('table', { name: 'Usuarios con rol de organizador' });

        expect(tabla).toHaveTextContent('Martin Pineda');
        expect(tabla).toHaveTextContent('sofia@unillanos.edu.co');
    });

    it('avisa cuando todavía no hay organizadores', async () => {
        render(<GestionOrganizadores />);

        expect(await screen.findByText('Aún no hay organizadores asignados.')).toBeInTheDocument();
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('muestra el error si no puede cargar la tabla', async () => {
        listarMock.mockRejectedValue(errorHttp(500, 'Error interno del servidor.'));
        render(<GestionOrganizadores />);

        expect(await screen.findByRole('alert')).toHaveTextContent('Error interno del servidor.');
    });

    it('revoca desde la tabla tras confirmar y la tabla se actualiza', async () => {
        listarMock.mockResolvedValueOnce([usuario(5, 'Martin Pineda', 'ORGANIZADOR')]).mockResolvedValue([]);
        revocarMock.mockResolvedValue({ mensaje: 'Rol de organizador revocado exitosamente.', usuarioId: 5, rol: 'USUARIO' });
        render(<GestionOrganizadores />);
        const user = userEvent.setup();

        await user.click(await screen.findByRole('button', { name: 'Revocar rol de Martin Pineda' }));
        expect(revocarMock).not.toHaveBeenCalled();
        await user.click(screen.getByRole('button', { name: 'Sí, revocar rol' }));

        await waitFor(() => expect(revocarMock).toHaveBeenCalledWith(5));
        expect(await screen.findByText('Aún no hay organizadores asignados.')).toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveTextContent('Rol de organizador revocado exitosamente.');
    });

    it('al asignar un rol desde la búsqueda, el nuevo organizador aparece en la tabla', async () => {
        buscarMock.mockResolvedValue([usuario(4, 'Laura Gomez', 'USUARIO')]);
        asignarMock.mockResolvedValue({ mensaje: 'Rol de organizador asignado exitosamente.', usuarioId: 4, rol: 'ORGANIZADOR' });
        listarMock.mockResolvedValueOnce([]).mockResolvedValue([usuario(4, 'Laura Gomez', 'ORGANIZADOR')]);
        render(<GestionOrganizadores />);
        const user = await buscar('laura');

        await user.click(await screen.findByRole('button', { name: 'Asignar organizador a Laura Gomez' }));

        const tabla = await screen.findByRole('table');
        expect(tabla).toHaveTextContent('laura@unillanos.edu.co');
    });

    // Escenario 2.0
    it('asigna el rol a un usuario, confirma y pasa a mostrarlo como organizador', async () => {
        buscarMock.mockResolvedValue([usuario(4, 'Laura Gomez', 'USUARIO')]);
        asignarMock.mockResolvedValue({ mensaje: 'Rol de organizador asignado exitosamente.', usuarioId: 4, rol: 'ORGANIZADOR' });
        render(<GestionOrganizadores />);
        const user = await buscar('laura');

        await user.click(await screen.findByRole('button', { name: 'Asignar organizador a Laura Gomez' }));

        expect(asignarMock).toHaveBeenCalledWith(4);
        expect(await screen.findByRole('status')).toHaveTextContent('Rol de organizador asignado exitosamente.');
        expect(screen.getByText(/laura@unillanos.edu.co · Organizador/)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Asignar organizador a Laura Gomez' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Revocar rol de organizador a Laura Gomez' })).toBeInTheDocument();
    });

    it('a quien ya es organizador no le ofrece asignar el rol otra vez', async () => {
        buscarMock.mockResolvedValue([usuario(5, 'Martin Pineda', 'ORGANIZADOR')]);
        render(<GestionOrganizadores />);

        await buscar('martin');

        expect(await screen.findByText(/martin@unillanos.edu.co · Organizador/)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Asignar organizador a/ })).not.toBeInTheDocument();
    });

    it('a un administrador no le ofrece ninguna acción', async () => {
        buscarMock.mockResolvedValue([usuario(1, 'Admin Eventu', 'ADMIN')]);
        render(<GestionOrganizadores />);

        await buscar('admin');

        expect(await screen.findByText(/admin@unillanos.edu.co · Administrador/)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /organizador a/i })).not.toBeInTheDocument();
    });

    it('muestra el rechazo del backend al asignar', async () => {
        buscarMock.mockResolvedValue([usuario(4, 'Laura Gomez', 'USUARIO')]);
        asignarMock.mockRejectedValue(errorHttp(409, 'El usuario ya es organizador.'));
        render(<GestionOrganizadores />);
        const user = await buscar('laura');

        await user.click(await screen.findByRole('button', { name: 'Asignar organizador a Laura Gomez' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('El usuario ya es organizador.');
    });

    // Escenario 4.0
    it('revoca el rol solo después de confirmar y conserva al usuario', async () => {
        buscarMock.mockResolvedValue([usuario(5, 'Martin Pineda', 'ORGANIZADOR')]);
        revocarMock.mockResolvedValue({ mensaje: 'Rol de organizador revocado exitosamente.', usuarioId: 5, rol: 'USUARIO' });
        render(<GestionOrganizadores />);
        const user = await buscar('martin');

        await user.click(await screen.findByRole('button', { name: 'Revocar rol de organizador a Martin Pineda' }));

        expect(screen.getByRole('dialog', { name: '¿Revocar rol de organizador?' })).toBeInTheDocument();
        expect(revocarMock).not.toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'Sí, revocar rol' }));

        await waitFor(() => expect(revocarMock).toHaveBeenCalledWith(5));
        expect(await screen.findByRole('status')).toHaveTextContent('Rol de organizador revocado exitosamente.');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.getByText(/martin@unillanos.edu.co · Usuario/)).toBeInTheDocument();
    });

    it('si cancela el diálogo no revoca nada', async () => {
        buscarMock.mockResolvedValue([usuario(5, 'Martin Pineda', 'ORGANIZADOR')]);
        render(<GestionOrganizadores />);
        const user = await buscar('martin');

        await user.click(await screen.findByRole('button', { name: 'Revocar rol de organizador a Martin Pineda' }));
        await user.click(screen.getByRole('button', { name: 'Cancelar' }));

        expect(revocarMock).not.toHaveBeenCalled();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.getByText(/martin@unillanos.edu.co · Organizador/)).toBeInTheDocument();
    });
});
