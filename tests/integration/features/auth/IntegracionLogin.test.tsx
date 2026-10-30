import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { FormularioLogin } from '../../../../src/features/auth/FormularioLogin';
import { obtenerSesion } from '../../../../src/features/sesion/sesion';

describe('Integración del inicio de sesión', () => {
    it('envía las credenciales, persiste la sesión y redirige según el rol', async () => {
        localStorage.clear();
        const user = userEvent.setup();
        render(
            <MemoryRouter initialEntries={['/login']}>
                <Routes>
                    <Route path="/login" element={<FormularioLogin />} />
                    <Route path="/admin/categorias" element={<p>Gestión de categorías</p>} />
                </Routes>
            </MemoryRouter>,
        );

        await user.type(screen.getByLabelText('Correo institucional'), 'admin@unillanos.edu.co');
        await user.type(screen.getByLabelText('Contraseña'), 'password-segura');
        await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

        expect(await screen.findByText('Gestión de categorías')).toBeInTheDocument();
        expect(localStorage.getItem('auth_token')).toBe('jwt-de-integracion');
        expect(obtenerSesion()).toEqual({
            usuarioId: 1,
            nombre: 'Admin EventU',
            correo: 'admin@unillanos.edu.co',
            rol: 'ADMIN',
        });
    });
});
