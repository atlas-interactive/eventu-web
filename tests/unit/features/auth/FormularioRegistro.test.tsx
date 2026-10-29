import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FormularioRegistro } from '../../../../src/features/auth/FormularioRegistro';
import { registrarUsuario } from '../../../../src/features/auth/services/authService';

vi.mock('../../../../src/features/auth/services/authService', () => ({
    registrarUsuario: vi.fn(),
}));

const registrarUsuarioMock = vi.mocked(registrarUsuario);

const renderFormulario = () =>
    render(
        <MemoryRouter>
            <FormularioRegistro />
        </MemoryRouter>,
    );

const completarFormulario = async (
    user: ReturnType<typeof userEvent.setup>,
    correo = 'laura@unillanos.edu.co',
    password = 'password-segura',
) => {
    await user.type(screen.getByLabelText('Nombre completo'), 'Laura Gomez');
    await user.type(screen.getByLabelText('Correo institucional'), correo);
    await user.type(screen.getByLabelText('Contraseña'), password);
};

const enviarFormulario = () => {
    const form = screen.getByLabelText('Nombre completo').closest('form');
    if (!form) {
        throw new Error('No se encontró el formulario de registro.');
    }
    fireEvent.submit(form);
};

describe('FormularioRegistro', () => {
    beforeEach(() => {
        registrarUsuarioMock.mockReset();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('muestra los campos y el enlace para iniciar sesión', () => {
        renderFormulario();

        expect(screen.getByRole('heading', { name: 'EventU' })).toBeInTheDocument();
        expect(screen.getByText('Crea tu cuenta')).toBeInTheDocument();
        expect(screen.getByLabelText('Nombre completo')).toBeInTheDocument();
        expect(screen.getByLabelText('Correo institucional')).toBeInTheDocument();
        expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Inicia sesión' })).toHaveAttribute('href', '/login');
    });

    it('rechaza correos que no sean institucionales sin llamar al servicio', async () => {
        const user = userEvent.setup();
        renderFormulario();
        await completarFormulario(user, 'laura@gmail.com');

        await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

        expect(screen.getByRole('alert')).toHaveTextContent(
            'Debe ingresar un correo institucional educativo válido.',
        );
        expect(registrarUsuarioMock).not.toHaveBeenCalled();
    });

    it('rechaza contraseñas con menos de ocho caracteres', async () => {
        const user = userEvent.setup();
        renderFormulario();
        await completarFormulario(user, 'laura@unillanos.edu.co', 'corta');

        enviarFormulario();

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'La contraseña debe tener entre 8 y 72 caracteres.',
        );
        expect(registrarUsuarioMock).not.toHaveBeenCalled();
    });

    it('muestra el estado de carga y limpia los campos tras un registro exitoso', async () => {
        const user = userEvent.setup();
        let resolverRegistro: ((value: { mensaje: string; usuarioId: bigint; correo: string; rol: string }) => void) | undefined;
        registrarUsuarioMock.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolverRegistro = resolve;
                }),
        );
        renderFormulario();
        await completarFormulario(user);

        await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

        expect(screen.getByRole('button', { name: 'Validando...' })).toBeDisabled();
        resolverRegistro?.({
            mensaje: 'Cuenta creada correctamente.',
            usuarioId: 1n,
            correo: 'laura@unillanos.edu.co',
            rol: 'estudiante',
        });

        expect(await screen.findByRole('status')).toHaveTextContent('Cuenta creada correctamente.');
        await waitFor(() => {
            expect(screen.getByLabelText('Nombre completo')).toHaveValue('');
            expect(screen.getByLabelText('Correo institucional')).toHaveValue('');
            expect(screen.getByLabelText('Contraseña')).toHaveValue('');
        });
        expect(registrarUsuarioMock).toHaveBeenCalledWith({
            nombre: 'Laura Gomez',
            correo: 'laura@unillanos.edu.co',
            password: 'password-segura',
        });
    });

    it('muestra un mensaje cuando el servicio falla inesperadamente', async () => {
        const user = userEvent.setup();
        registrarUsuarioMock.mockRejectedValue(new Error('Fallo de red'));
        renderFormulario();
        await completarFormulario(user);

        await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Ocurrió un error inesperado al conectar con el servidor.',
        );
        expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeEnabled();
    });
});