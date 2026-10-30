import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { FormularioRegistro } from '../../../../src/features/auth/FormularioRegistro';

describe('Integración del registro', () => {
    it('envía los datos al endpoint y presenta el resultado exitoso del servidor', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <FormularioRegistro />
            </MemoryRouter>,
        );

        await user.type(screen.getByLabelText('Nombre completo'), 'Laura Gomez');
        await user.type(screen.getByLabelText('Correo institucional'), 'laura@unillanos.edu.co');
        await user.type(screen.getByLabelText('Contraseña'), 'password-segura');
        await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

        expect(await screen.findByRole('status')).toHaveTextContent(
            'Registro completado correctamente.',
        );
        expect(screen.getByLabelText('Nombre completo')).toHaveValue('');
        expect(screen.getByLabelText('Correo institucional')).toHaveValue('');
        expect(screen.getByLabelText('Contraseña')).toHaveValue('');
    });
});