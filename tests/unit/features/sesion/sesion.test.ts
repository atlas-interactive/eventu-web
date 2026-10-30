import { beforeEach, describe, expect, it } from 'vitest';
import {
    cerrarSesion,
    esAdministrador,
    esOrganizador,
    esUsuario,
    guardarSesion,
    obtenerRutaInicio,
    obtenerSesion,
    puedeGestionarEventos,
} from '../../../../src/features/sesion/sesion';

const sesion = {
    usuarioId: 1,
    nombre: 'Ana Ejemplo',
    correo: 'ana@unillanos.edu.co',
};

describe('sesion', () => {
    beforeEach(() => localStorage.clear());

    it('guarda y recupera la sesión separando el token de los datos del usuario', () => {
        guardarSesion({ ...sesion, token: 'jwt-de-prueba', rol: 'ADMIN' });

        expect(localStorage.getItem('auth_token')).toBe('jwt-de-prueba');
        expect(obtenerSesion()).toEqual({ ...sesion, rol: 'ADMIN' });
    });

    it('elimina tanto el token como el usuario al cerrar sesión', () => {
        guardarSesion({ ...sesion, token: 'jwt-de-prueba', rol: 'ADMIN' });

        cerrarSesion();

        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(obtenerSesion()).toBeNull();
    });

    it('trata los datos de sesión dañados como una sesión inexistente', () => {
        localStorage.setItem('auth_usuario', '{json inválido');

        expect(obtenerSesion()).toBeNull();
    });

    it('reconoce roles sin distinguir mayúsculas y asigna la ruta inicial', () => {
        const administrador = { ...sesion, rol: 'admin' };
        const organizador = { ...sesion, rol: 'ORGANIZADOR' };
        const usuario = { ...sesion, rol: 'Usuario' };
        const desconocido = { ...sesion, rol: 'INVITADO' };

        expect(esAdministrador(administrador)).toBe(true);
        expect(esOrganizador(organizador)).toBe(true);
        expect(esUsuario(usuario)).toBe(true);
        expect(puedeGestionarEventos(administrador)).toBe(true);
        expect(puedeGestionarEventos(organizador)).toBe(true);
        expect(puedeGestionarEventos(usuario)).toBe(false);
        expect(obtenerRutaInicio(administrador)).toBe('/admin/categorias');
        expect(obtenerRutaInicio(organizador)).toBe('/organizador/eventos');
        expect(obtenerRutaInicio(usuario)).toBe('/usuario');
        expect(obtenerRutaInicio(desconocido)).toBe('/no-autorizado');
        expect(esAdministrador(null)).toBe(false);
    });
});
