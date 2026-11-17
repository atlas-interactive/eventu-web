import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormularioLogin } from '../../../../src/features/auth/FormularioLogin';
import { FormularioRegistro } from '../../../../src/features/auth/FormularioRegistro';
import { autenticarUsuario, registrarUsuario } from '../../../../src/features/auth/services/authService';

vi.mock('../../../../src/features/auth/services/authService', () => ({
    autenticarUsuario: vi.fn(),
    registrarUsuario: vi.fn(),
    reenviarConfirmacion: vi.fn(),
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('Visibilidad de la contraseña', () => {
    it.each([
        ['login', FormularioLogin, 'current-password'],
        ['registro', FormularioRegistro, 'new-password'],
    ] as const)('permite mostrar y ocultar en %s sin cambiar el valor ni enviar el formulario', async (_, Formulario, autocomplete) => {
        const user = userEvent.setup();
        render(<MemoryRouter><Formulario /></MemoryRouter>);
        if (screen.queryByLabelText('Nombre completo')) {
            await user.type(screen.getByLabelText('Nombre completo'), 'Laura Gomez');
        }
        await user.type(screen.getByLabelText('Correo institucional'), 'laura@unillanos.edu.co');
        const campo = screen.getByLabelText('Contraseña');
        await user.type(campo, 'password-segura');
        expect(campo).toHaveAttribute('type', 'password');

        await user.tab();
        const mostrar = screen.getByRole('button', { name: 'Mostrar contraseña' });
        expect(mostrar).toHaveFocus();
        expect(mostrar).toHaveAttribute('aria-controls', campo.id);
        await user.keyboard('{Enter}');
        expect(campo).toHaveAttribute('type', 'text');
        expect(campo).toHaveValue('password-segura');
        expect(campo).toHaveAttribute('autocomplete', autocomplete);

        expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toHaveFocus();
        await user.keyboard(' ');
        expect(campo).toHaveAttribute('type', 'password');
        expect(campo).toHaveValue('password-segura');
        expect(screen.getByRole('button', { name: 'Mostrar contraseña' })).toHaveFocus();
        expect(autenticarUsuario).not.toHaveBeenCalled();
        expect(registrarUsuario).not.toHaveBeenCalled();
    });
});
