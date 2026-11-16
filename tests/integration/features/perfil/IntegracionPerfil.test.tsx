import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { AppRoutes } from '../../../../src/routes/AppRoutes';
import { guardarSesion } from '../../../../src/features/sesion/sesion';
import { server } from '../../../mocks/server';
import type { PerfilUsuario } from '../../../../src/types/perfil';

// Backend simulado con memoria: el perfil guardado se devuelve en la siguiente consulta
let perfil: PerfilUsuario;
const CONTRASENA = 'Perfil1234';

const usarBackendSimulado = () =>
    server.use(
        http.get('*/perfil', () => HttpResponse.json(perfil)),
        http.put('*/perfil', async ({ request }) => {
            const datos = (await request.json()) as Partial<PerfilUsuario>;
            perfil = { ...perfil, nombre: datos.nombre ?? perfil.nombre };
            return HttpResponse.json(perfil);
        }),
        http.put('*/perfil/contrasena', async ({ request }) => {
            const { passwordActual } = (await request.json()) as { passwordActual: string };
            if (passwordActual !== CONTRASENA) {
                return HttpResponse.json({ error: 'La contraseña ingresada no es correcta.' }, { status: 400 });
            }
            return HttpResponse.json({ mensaje: 'Contraseña actualizada exitosamente.', token: 'token-nuevo' });
        }),
        http.patch('*/perfil/desactivar', () =>
            HttpResponse.json({ mensaje: 'Tu cuenta fue desactivada. Puedes reactivarla iniciando sesión de nuevo.' }),
        ),
    );

const abrir = () =>
    render(
        <MemoryRouter initialEntries={['/perfil']}>
            <AppRoutes />
        </MemoryRouter>,
    );

const cambiarContrasena = async (usuario: ReturnType<typeof userEvent.setup>, actual: string) => {
    await usuario.type(await screen.findByLabelText('Contraseña actual'), actual);
    await usuario.type(screen.getByLabelText('Nueva contraseña'), 'NuevaClave123');
    await usuario.type(screen.getByLabelText('Confirmar nueva contraseña'), 'NuevaClave123');
    await usuario.click(screen.getByRole('button', { name: 'Actualizar contraseña' }));
};

// Más tiempo: la primera carga de las pantallas es lenta cuando se mide la cobertura
describe('Perfil de usuario (HU-19)', { timeout: 15000 }, () => {
    beforeEach(() => {
        localStorage.clear();
        perfil = {
            id: 12,
            nombre: 'Perfil Pruebas',
            correo: 'perfil.pruebas@unillanos.edu.co',
            rol: 'USUARIO',
            codigoInstitucional: null,
            creadoEn: '2026-09-01T10:00:00',
        };
        guardarSesion({ token: 'token-perfil', usuarioId: 12, nombre: 'Perfil Pruebas', correo: perfil.correo, rol: 'USUARIO' });
        usarBackendSimulado();
    });

    it('edita el nombre y lo muestra actualizado', async () => {
        const usuario = userEvent.setup({ delay: null });
        abrir();

        await usuario.click(await screen.findByRole('button', { name: 'Editar información' }));
        const nombre = screen.getByRole('textbox', { name: 'Nombre completo' });
        await usuario.clear(nombre);
        await usuario.type(nombre, 'Perfil Pruebas Editado');
        await usuario.click(screen.getByRole('button', { name: 'Guardar cambios' }));

        expect(await screen.findByText('Tu información se actualizó correctamente.')).toBeInTheDocument();
        expect(await screen.findByRole('heading', { name: 'Perfil Pruebas Editado' })).toBeInTheDocument();
    });

    it('cambia la contraseña y avisa cuando la actual es incorrecta', async () => {
        const usuario = userEvent.setup({ delay: null });
        abrir();

        await cambiarContrasena(usuario, 'ClaveIncorrecta1');
        expect(await screen.findByRole('alert')).toHaveTextContent('La contraseña ingresada no es correcta.');

        await usuario.clear(screen.getByLabelText('Contraseña actual'));
        await usuario.clear(screen.getByLabelText('Nueva contraseña'));
        await usuario.clear(screen.getByLabelText('Confirmar nueva contraseña'));
        await cambiarContrasena(usuario, CONTRASENA);
        expect(await screen.findByText('Contraseña actualizada exitosamente.')).toBeInTheDocument();
        expect(localStorage.getItem('auth_token')).toBe('token-nuevo');
    });

    it('desactiva la cuenta y vuelve al inicio de sesión con el aviso', async () => {
        const usuario = userEvent.setup({ delay: null });
        abrir();

        await usuario.click(await screen.findByRole('button', { name: 'Desactivar mi cuenta' }));
        const dialogo = screen.getByRole('dialog');
        await usuario.type(within(dialogo).getByLabelText(/Contraseña/), CONTRASENA);
        await usuario.click(within(dialogo).getByRole('button', { name: 'Confirmar desactivación' }));

        expect(await screen.findByText(/Tu cuenta fue desactivada/)).toBeInTheDocument();
        expect(localStorage.getItem('auth_token')).toBeNull();
    });
});
