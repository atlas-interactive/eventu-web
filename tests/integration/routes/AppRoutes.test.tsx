import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../../../src/routes/AppRoutes';
import { guardarSesion } from '../../../src/features/sesion/sesion';

describe('AppRoutes', () => {
    beforeEach(() => localStorage.clear());

    it('redirige una ruta desconocida al login y carga el formulario diferido', async () => {
        render(
            <MemoryRouter initialEntries={['/ruta-inexistente']}>
                <AppRoutes />
            </MemoryRouter>,
        );

        expect(await screen.findByLabelText('Correo institucional')).toBeInTheDocument();
    });

    it('abre el inicio de usuario para una sesión con rol USUARIO', async () => {
        guardarSesion({
            token: 'token-de-prueba',
            usuarioId: 1,
            nombre: 'Ana Ejemplo',
            correo: 'ana@unillanos.edu.co',
            rol: 'USUARIO',
        });
        render(
            <MemoryRouter initialEntries={['/usuario']}>
                <AppRoutes />
            </MemoryRouter>,
        );

        expect(
            await screen.findByText(
                'Sesión iniciada exitosamente, el listado de eventos estará disponible en la próxima versión.',
            ),
        ).toBeInTheDocument();
    });
});
