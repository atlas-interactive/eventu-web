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

describe('Recuperación de contraseña', () => {
    beforeEach(() => localStorage.clear());

    it('solicita un enlace usando solo el correo y muestra la respuesta genérica', async () => {
        let solicitud: unknown;
        server.use(
            http.post('*/auth/recuperar-contrasena', async ({ request }) => {
                solicitud = await request.json();
                return HttpResponse.json({
                    mensaje: 'Si el correo está registrado, te enviamos un enlace.',
                });
            }),
        );
        const usuario = userEvent.setup();
        renderizarRuta('/recuperar-contrasena');

        await usuario.type(
            await screen.findByLabelText('Correo institucional'),
            'laura@unillanos.edu.co',
        );
        expect(screen.getByLabelText('Correo institucional')).toBeInTheDocument();
        expect(screen.queryByLabelText('Contraseña')).not.toBeInTheDocument();
        await usuario.click(screen.getByRole('button', { name: 'Enviar enlace' }));

        expect(await screen.findByRole('status')).toHaveTextContent(
            'Si el correo está registrado, te enviamos un enlace.',
        );
        expect(solicitud).toEqual({ correo: 'laura@unillanos.edu.co' });
    });

    it('rechaza un correo no institucional sin enviar una solicitud', async () => {
        let solicitudes = 0;
        server.use(
            http.post('*/auth/recuperar-contrasena', () => {
                solicitudes += 1;
                return HttpResponse.json({ mensaje: 'No debería enviarse.' });
            }),
        );
        const usuario = userEvent.setup();
        renderizarRuta('/recuperar-contrasena');

        await usuario.type(
            await screen.findByLabelText('Correo institucional'),
            'laura@example.com',
        );
        await usuario.click(screen.getByRole('button', { name: 'Enviar enlace' }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Debe ingresar un correo institucional válido.',
        );
        expect(solicitudes).toBe(0);
    });

    it('informa que el enlace no es válido y permite solicitar otro sin token', async () => {
        renderizarRuta('/restablecer-contrasena');

        expect(await screen.findByRole('heading', { name: 'Enlace no válido' })).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveTextContent(
            'El enlace para restablecer la contraseña no es válido.',
        );
        expect(screen.getByRole('link', { name: 'Solicitar otro correo' })).toHaveAttribute(
            'href',
            '/recuperar-contrasena',
        );
    });

    it('valida la confirmación y lleva al login al restablecer correctamente', async () => {
        let solicitud: unknown;
        server.use(
            http.post('*/auth/restablecer-contrasena', async ({ request }) => {
                solicitud = await request.json();
                return HttpResponse.json({
                    mensaje: 'Tu contraseña se actualizó. Ya puedes iniciar sesión.',
                });
            }),
        );
        const usuario = userEvent.setup();
        renderizarRuta('/restablecer-contrasena?token=token-de-prueba');

        await usuario.type(await screen.findByLabelText('Nueva contraseña'), 'password-segura');
        await usuario.type(screen.getByLabelText('Confirmar contraseña'), 'password-distinta');
        await usuario.click(screen.getByRole('button', { name: 'Restablecer contraseña' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Las contraseñas no coinciden.');
        expect(solicitud).toBeUndefined();

        await usuario.clear(screen.getByLabelText('Confirmar contraseña'));
        await usuario.type(screen.getByLabelText('Confirmar contraseña'), 'password-segura');
        await usuario.click(screen.getByRole('button', { name: 'Restablecer contraseña' }));

        expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument();
        expect(await screen.findByRole('status')).toHaveTextContent(
            'Tu contraseña se actualizó. Ya puedes iniciar sesión.',
        );
        expect(solicitud).toEqual({ token: 'token-de-prueba', password: 'password-segura' });
    });

    it('muestra el error del backend y permite solicitar otro enlace si el token falla', async () => {
        server.use(
            http.post('*/auth/restablecer-contrasena', () =>
                HttpResponse.json(
                    { error: 'El enlace para restablecer la contraseña no es válido o ya venció.' },
                    { status: 400 },
                ),
            ),
        );
        const usuario = userEvent.setup();
        renderizarRuta('/restablecer-contrasena?token=token-vencido');

        await usuario.type(await screen.findByLabelText('Nueva contraseña'), 'password-segura');
        await usuario.type(screen.getByLabelText('Confirmar contraseña'), 'password-segura');
        await usuario.click(screen.getByRole('button', { name: 'Restablecer contraseña' }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'El enlace para restablecer la contraseña no es válido o ya venció.',
        );
        expect(screen.getByRole('link', { name: 'Solicitar otro correo' })).toHaveAttribute(
            'href',
            '/recuperar-contrasena',
        );
    });
});
