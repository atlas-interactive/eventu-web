import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axiosClient } from '../../../src/api';
import { server } from '../../mocks/server';

describe('axiosClient', () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => vi.unstubAllGlobals());

    it('adjunta el token de la sesión a las solicitudes', async () => {
        localStorage.setItem('auth_token', 'jwt-de-prueba');
        server.use(
            http.get('*/prueba-token', ({ request }) =>
                HttpResponse.json({ authorization: request.headers.get('authorization') }),
            ),
        );

        const respuesta = await axiosClient.get('/prueba-token');

        expect(respuesta.data.authorization).toContain('jwt-de-prueba');
    });

    it('limpia la sesión y redirige al login ante una respuesta 401', async () => {
        const ubicacion = { pathname: '/organizador/eventos', href: '/organizador/eventos' };
        vi.stubGlobal('window', { location: ubicacion });
        localStorage.setItem('auth_token', 'jwt-vencido');
        localStorage.setItem('auth_usuario', '{"rol":"ORGANIZADOR"}');
        server.use(http.get('*/prueba-401', () => new HttpResponse(null, { status: 401 })));

        await expect(axiosClient.get('/prueba-401')).rejects.toMatchObject({
            response: { status: 401 },
        });

        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(localStorage.getItem('auth_usuario')).toBeNull();
        expect(ubicacion.href).toBe('/login');
    });

    it('redirige a la pantalla de no autorizado ante una respuesta 403', async () => {
        const ubicacion = { pathname: '/organizador/eventos', href: '/organizador/eventos' };
        vi.stubGlobal('window', { location: ubicacion });
        server.use(http.get('*/prueba-403', () => new HttpResponse(null, { status: 403 })));

        await expect(axiosClient.get('/prueba-403')).rejects.toMatchObject({
            response: { status: 403 },
        });

        expect(ubicacion.href).toBe('/no-autorizado');
    });
});
