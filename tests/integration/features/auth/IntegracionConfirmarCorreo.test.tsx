import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../../../../src/routes/AppRoutes';
import { http, HttpResponse } from 'msw';
import { server } from '../../../mocks/server';

const renderizarRuta = (ruta: string) =>
    render(
        <MemoryRouter initialEntries={[ruta]}>
            <AppRoutes />
        </MemoryRouter>,
    );

describe('Confirmación de correo', () => {
    beforeEach(() => localStorage.clear());

    it('confirma el token recibido en la URL y muestra la respuesta del servidor', async () => {
        let solicitud: unknown;
        server.use(
            http.post('*/auth/confirmar-correo', async ({ request }) => {
                solicitud = await request.json();
                return HttpResponse.json({ mensaje: 'Correo confirmado. Ya puedes iniciar sesión.' });
            }),
        );

        renderizarRuta('/confirmar-correo?token=token-de-prueba');

        expect(
            await screen.findByText('Correo confirmado. Ya puedes iniciar sesión.'),
        ).toBeInTheDocument();
        expect(solicitud).toEqual({ token: 'token-de-prueba' });
        expect(screen.getByRole('link', { name: 'Ir a iniciar sesión' })).toHaveAttribute('href', '/login');
    });

    it('muestra el error del servidor cuando el enlace de confirmación falla', async () => {
        server.use(
            http.post('*/auth/confirmar-correo', () =>
                HttpResponse.json({ error: 'El enlace no es válido.' }, { status: 400 }),
            ),
        );

        renderizarRuta('/confirmar-correo?token=token-vencido');

        expect(await screen.findByRole('alert')).toHaveTextContent('El enlace no es válido.');
        expect(screen.getByRole('link', { name: 'Ir a iniciar sesión' })).toHaveAttribute('href', '/login');
    });

    it('informa cuando falta el token y no intenta confirmar el correo', async () => {
        let solicitudes = 0;
        server.use(
            http.post('*/auth/confirmar-correo', () => {
                solicitudes += 1;
                return HttpResponse.json({ mensaje: 'No debería confirmarse.' });
            }),
        );

        renderizarRuta('/confirmar-correo');

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'El enlace para confirmar tu correo no es válido o ya venció.',
        );
        expect(solicitudes).toBe(0);
    });

    it('permite reenviar el enlace después de un 403 al iniciar sesión', async () => {
        let solicitudLogin: unknown;
        let solicitudReenvio: unknown;
        server.use(
            http.post('*/auth/login', async ({ request }) => {
                solicitudLogin = await request.json();
                return HttpResponse.json(
                    { error: 'Debes confirmar tu correo.' },
                    { status: 403 },
                );
            }),
            http.post('*/auth/reenviar-confirmacion', async ({ request }) => {
                solicitudReenvio = await request.json();
                return HttpResponse.json({ mensaje: 'Enviamos otro enlace de confirmación.' });
            }),
        );
        const usuario = userEvent.setup();
        renderizarRuta('/login');

        await usuario.type(
            await screen.findByLabelText('Correo institucional'),
            'laura@unillanos.edu.co',
        );
        await usuario.type(screen.getByLabelText('Contraseña'), 'password-segura');
        await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Debes confirmar tu correo.');
        await usuario.click(screen.getByRole('button', { name: 'Reenviar enlace' }));

        expect(await screen.findByText('Enviamos otro enlace de confirmación.')).toBeInTheDocument();
        expect(solicitudLogin).toEqual({
            correo: 'laura@unillanos.edu.co',
            password: 'password-segura',
        });
        expect(solicitudReenvio).toEqual({ correo: 'laura@unillanos.edu.co' });
        expect(screen.getByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument();
    });
});
